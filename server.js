const http=require('http');
const nodemailer=require('nodemailer');
const fs=require('fs');
const cookie=require('cookie');
const {v4:uuidv4}=require('uuid');
const sessions={};
const server=http.createServer((req,res)=>{
    const cookies=cookie.parse(req.headers.cookie||"");
    if(req.method=="GET"&&req.url=="/"){
        const session=sessions[cookies.sessionId];
        if(session){
            fs.readFile("welcome.html","utf8",(err,data)=>{
                if(err){
                    return console.log("error");
                }
                 data = data.replace(
            "{{name}}",
            session.name
        ); 
               res.writeHead(200,{
                "content-Type":"text/html"
               });
                 res.end(data);
            });
            return;
        }
        fs.readFile("login.html","utf8",(err,data)=>{
             if(err){
                    return console.log("error");
                }
               res.writeHead(200,{
                "content-Type":"text/html"
               });
                return res.end(data);
            });
    }
    if(req.url==="/login.css"){

    fs.readFile("login.css",(err,data)=>{

        if(err){

            res.statusCode=404;

            return res.end("CSS not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/css"

        });

        res.end(data);

    });

    return;
}
if(req.url==="/sendmail.html"){

    fs.readFile("sendmail.html",(err,data)=>{

        if(err){

            res.statusCode=404;

            return res.end("sendemail not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/html"

        });

        res.end(data);

    });

    return;
}
    
if(req.url==="/sendmail.css"){
    fs.readFile("sendmail.css",(err,data)=>{
        res.writeHead(200,{"Content-Type":"text/css"});
        res.end(data);
    });
    return;
}
    if(req.url=="/style.css"){
        fs.readFile("style.css",(err,data)=>{
             if(err){
            res.statusCode=404;

            return res.end("CSS not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/css"

        });

        res.end(data);

        });
    }
    if(req.method=="POST"&&req.url=="/login"){
        let body="";
        req.on("data",(chunks)=>{
            body+=chunks;
        });
        req.on('end',async()=>{
            try{
            let params=new URLSearchParams(body);
            let email=params.get("email");
            let name=params.get("name");
            let apppassword=params.get("apppassword");
            const transporter=nodemailer.createTransport({
                service: "gmail",
                auth:{
                    user:email,
                    pass:apppassword,
                }
            });
            await transporter.verify();
             const sessionId=uuidv4();
            sessions[sessionId]={
                name,
                email,
                apppassword
            };
            res.setHeader(
                "Set-Cookie",
                `sessionId=${sessionId};HttpOnly`
            );
            res.statusCode=302;
            res.setHeader(
                "location",
                "/dashboard"
            );
            res.end();
        }catch(err){
            fs.readFile("loginfailed.html","utf8",(err,data)=>{
                if(err){
                    return console.log("error");
                }
                return res.end(data);
        });
    }
        });
    }
    if(req.method=="GET"&&req.url=="/dashboard"){
        const session=sessions[cookies.sessionId];
        if(session){
            fs.readFile("dashboard.html","utf8",(err,data)=>{
                if(err){
                    return console.log("error");
                }
                res.writeHead(200,{"content-Type":"text/html"});
                data=data.replace(
                    "{{email}}",
                    session.email
                );
                res.end(data)
            });  
        }
        else{
            res.statusCode=302;
            res.setHeader(
                "location",
                "/"
            );
            return res.end();
        }
    }
     if(req.url=="/style1.css"){
        fs.readFile("style1.css",(err,data)=>{
             if(err){
            res.statusCode=404;

            return res.end("CSS not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/css"

        });

        res.end(data);

        });
    }
    if(req.url=="/logout"){
        delete sessions[cookies.sessionId];
        res.setHeader(
            "Set-Cookie",
            "sessionId=; Max-Age=0"
        );
        res.statusCode=302;
        res.setHeader("location",
            "/"
        );
        return res.end();
    }
    if(req.method=="POST"&&req.url=="/sendmail"){
        let session=sessions[cookies.sessionId];
            if(session){
        let body="";
        req.on("data",(chunks)=>{
            body+=chunks;
        });
        req.on('end',async()=>{
            try{
            let params=new URLSearchParams(body);
            let to=params.get("to");
            let subject=params.get("subject");
            let message=params.get("message");
            const transporter=nodemailer.createTransport({
                service:"gmail",
                auth:{
                    user:session.email,
                    pass:session.apppassword
                }
            });
            await transporter.sendMail({
                from:session.email,
                to:to,
                subject:subject,
                text:message
            });
            fs.readFile("sended.html","utf8",(err,data)=>{
                if(err){
                    console.log(err);
                }
                data=data.replace(
                    "{{tomail}}",
                    to
                );
                 res.writeHead(200,{"content-Type":"text/html"});
                 res.end(data);
            })
        }catch(err){
            console.log("failed to send");
        }
        });
    }

    else{
        res.statusCode=302;
        res.setHeader("location",
            "/"
        );
        res.end();
    }
}
   if(req.url=="/sender.css"){
        fs.readFile("style1.css",(err,data)=>{
             if(err){
            res.statusCode=404;

            return res.end("CSS not found");

        }
    });
}
if(req.url==="/welcome.html"){

    fs.readFile("welcome.html",(err,data)=>{

        if(err){

            res.statusCode=404;

            return res.end("welcome not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/html"

        });

        res.end(data);

    });

    return;
}
if(req.url=="/profile.html"){

    const session = sessions[cookies.sessionId];

    if(!session){
        res.writeHead(302,{Location:"/"});
        return res.end();
    }

    fs.readFile("profile.html","utf8",(err,data)=>{
        if(err){
            res.statusCode=404;
            return res.end("profile not found");
        }

        data = data.replace("{{name}}", session.name);
        data = data.replace("{{email}}", session.email);

        res.writeHead(200,{
            "Content-Type":"text/html"
        });

        res.end(data);
    });

    return;
}
if(req.url=="/profile.css"){

    fs.readFile("profile.css",(err,data)=>{

        if(err){

            res.statusCode=404;

            return res.end("welcome not found");

        }

        res.writeHead(200,{

            "Content-Type":"text/css"

        });

        res.end(data);

    });

    return;
}
 
});
const PORT = process.env.PORT || 3000;
server.listen(PORT,()=>{
    console.log("server started poorna");
});
