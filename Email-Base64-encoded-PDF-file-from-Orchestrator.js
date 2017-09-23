// Copyright 2016, VMware, Inc. All Rights Reserved
//
// VMware vRealize Orchestrator action sample
// 
// Email Base64 encoded PDF file from Orchestrator
//
// This sample takes a base64 encoded PDF from a web service and attaches
// it to an email message with vRealize Orchestrator.
//
// Currently this sample requires enabling local process execution.
// The local process and file I/O will be performed as the 'vco' user.
// See the following documentation section for details on how to enable
// the local process execution:
//
// http://pubs.vmware.com/orchestrator-70/topic/com.vmware.vrealize.orchestrator-install-config.doc/GUID-F4995BD2-F2F7-48C0-B239-197F27FFE693.html
//
//Action Inputs:
// base64String  -  string
//
//Return type: void

try {
    //write the base64 file to a temp location
    var b64File = new File("/var/lib/vco/app-server/temp/"+workflow.id+".b64");
    b64File.write(base64String);

    //the pdf file will be decoded from the base64 file
    var pdfFile = new File("/var/lib/vco/app-server/temp/"+workflow.id+".pdf");

    //decode on the gnu base64 in a oneliner so orchestrator and java isn't
    //messing with string encoding here
    var script = "#!/bin/bash\n"+
    "cat "+b64File.path+" | /usr/bin/base64 -d -i > "+pdfFile.path+"\n";

    //This requires "com.vmware.js.allow-local-process = true" to be added to:
    //  /etc/vco/app-server/vmo.properties 
    //
    var cmd = new Command("bash");
    cmd.input = script;
    var exitnum = cmd.execute(true); //true waits until process is complete
    System.log(exitnum);

    var message = new EmailMessage();
    message.fromAddress = "dlinsley@corp.local";
    message.fromName = "dan";
    message.subject = "with pdf";
    message.toAddress= "you@corp.local";
    //Optionally specify the SMTP connection settings
    //message.smtpHost = "172.16.6.1";
    //message.smtpPort = "3000";

    // read the file object. File extension is important for
    // automatic mime typing
    var pdfFileMime = new MimeAttachment(pdfFile);  
    System.log(pdfFileMime.mimeType);

    //First part is the message body
    message.addMimePart("The body", "text/plain");

    //Second part is the PDF Attachment
    message.addMimePart(pdfFileMime);
    message.sendMessage();

} finally {
    b64File.deleteFile();
    pdfFile.deleteFile();
}