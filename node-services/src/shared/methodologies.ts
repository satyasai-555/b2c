import { randomInt, randomUUID } from "node:crypto";
import type { AuthSession, CompleteInterviewPayload, CvRecord, InterviewRecord, OtpRequest, SaveAnswersPayload, StartInterviewPayload, UploadCvPayload, UpsertCandidatePayload } from "./domain/types.js";
import { CandidateDb } from "./database/database.js";
import { createConnection } from "node:net";
const now=()=>new Date().toISOString();
const initials=(name:string)=>name.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
const sendOtpEmail=(to:string,code:string)=>new Promise<void>((resolve,reject)=>{const socket=createConnection({host:process.env.SMTP_HOST??"localhost",port:Number(process.env.SMTP_PORT??1025)});let buffer="";let step=0;const commands=[`HELO welhire.local`,`MAIL FROM:<${process.env.SMTP_FROM??"no-reply@welhire.local"}>`,`RCPT TO:<${to}>`,`DATA`,`From: ${process.env.SMTP_FROM??"no-reply@welhire.local"}\r\nTo: ${to}\r\nSubject: Your WelHire verification code\r\n\r\nYour WelHire verification code is ${code}. It expires in 10 minutes.\r\n.` ,`QUIT`];socket.setTimeout(5000);socket.on("data",chunk=>{buffer+=chunk.toString();if(!buffer.includes("\r\n"))return;buffer="";if(step>=commands.length){socket.end();resolve();return;}socket.write(`${commands[step++]}\r\n`);});socket.on("error",reject);socket.on("timeout",()=>{socket.destroy();reject(new Error("SMTP connection timed out"));});});
export class CandidateMethods {
 constructor(private readonly db:CandidateDb){}
 async createOrUpdateGuest(guestSessionId:string,payload:UpsertCandidatePayload={}){const old=await this.db.findCandidateByGuestSession(guestSessionId);const time=now();const name=payload.name??old?.name??"";return this.db.saveCandidate({id:old?.id??randomUUID(),guestSessionId,email:old?.email??"",name,initials:initials(name),role:payload.role??old?.role??null,experience:payload.experience??old?.experience??null,location:payload.location??old?.location??null,createdAt:old?.createdAt??time,updatedAt:time});}
 async claimCandidate(guestSessionId:string,email:string){
  const normalizedEmail=email.toLowerCase();
  const guest=await this.db.findCandidateByGuestSession(guestSessionId);
  const existing=await this.db.findCandidateByEmail(normalizedEmail);
  const old=existing??guest??await this.createOrUpdateGuest(guestSessionId);
  const displayName=old.name|| (normalizedEmail.split("@")[0]??"").replace(/[._-]+/g," ").trim();
  return this.db.saveCandidate({...old,email:normalizedEmail,name:displayName,initials:initials(displayName),updatedAt:now()});
 }
 async updateCandidate(id:string,payload:UpsertCandidatePayload){const old=await this.require(id);const name=payload.name??old.name;return this.db.saveCandidate({...old,...payload,name,initials:initials(name),updatedAt:now()});}
 async uploadCv(candidateId:string,payload:UploadCvPayload){await this.require(candidateId);const cv:CvRecord={id:randomUUID(),candidateId,fileName:payload.fileName,fileSize:payload.fileSize??null,mimeType:payload.mimeType??null,parsed:true,parsedDetails:{skills:["React","TypeScript","JavaScript","CSS"],yearsExperience:3.5,parserVersion:"node-mock-parser-1.0"},uploadedAt:now()};return this.db.saveCv(cv);}
 saveAnswers(id:string,payload:SaveAnswersPayload){return this.updateCandidate(id,payload);}
 async startInterview(candidateId:string,payload:StartInterviewPayload){await this.require(candidateId);const interview:InterviewRecord={id:randomUUID(),candidateId,role:payload.role,status:"started",answers:[],score:null,startedAt:now(),completedAt:null};return this.db.saveInterview(interview);}
 async completeInterview(candidateId:string,interviewId:string,payload:CompleteInterviewPayload){await this.require(candidateId);const old=(await this.db.listInterviews(candidateId)).find(x=>x.id===interviewId);if(!old)throw new Error("Interview not found");return this.db.saveInterview({...old,status:"completed",answers:payload.answers,score:payload.answers.length?65:null,completedAt:now()});}
 async getCandidate(id:string){const candidate=await this.require(id);return{candidate,cvs:await this.db.listCvs(id),interviews:await this.db.listInterviews(id)};}
 private async require(id:string){const candidate=await this.db.findCandidateById(id);if(!candidate)throw new Error("Candidate not found");return candidate;}
}
export class AuthMethods{
 constructor(private readonly db:CandidateDb,private readonly candidates:CandidateMethods){}
 async requestOtp(email:string,guestSessionId:string){const request:OtpRequest={id:randomUUID(),email:email.toLowerCase(),guestSessionId,code:String(randomInt(100000,1000000)),expiresAt:Date.now()+600000,attempts:0};await this.db.saveOtp(request);await sendOtpEmail(request.email,request.code);return{requestId:request.id,expiresAt:new Date(request.expiresAt).toISOString()};}
 async verifyOtp(requestId:string,email:string,code:string){const request=await this.db.findOtp(requestId);if(!request||request.email!==email.toLowerCase()||request.expiresAt<Date.now()||request.attempts>=5||request.code!==code)throw new Error("Invalid or expired OTP");const candidate=await this.candidates.claimCandidate(request.guestSessionId,email);const session:AuthSession={token:randomUUID(),candidateId:candidate.id,expiresAt:Date.now()+604800000};await this.db.saveSession(session);return{token:session.token,expiresAt:new Date(session.expiresAt).toISOString(),candidate};}
 async isSessionValid(token:string){const session=await this.db.findSession(token);return Boolean(session&&session.expiresAt>Date.now());}
}
