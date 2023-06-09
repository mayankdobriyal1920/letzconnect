import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import nodemailer  from 'nodemailer';
import request  from 'request';
import jwt from 'jsonwebtoken';
const skypeCloneRouter = express.Router();
import {
    loginUser,
    getAllUserData,
    insertCommonApiCall,
    updateCommonApiCall,
    deleteCommonApiCall,
    getAllCallLogData, checkPasswordForUser, checkEmailOfUser, getAllAdminUserData
} from '../models/userModel.js';
import {
    _getUniqueId,
    loggedInUserDetails,
    newMeetingData,
    newRoomCreatedCustomApi,
    newRoomCreatedCustomApiMembers
} from "../server.js";

skypeCloneRouter.post(
    '/login',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
            userData:{},
        }
        loginUser(req.body)
            .then(user => {
                if(user && user.length) {
                    let response = user[0];
                    let token = Math.floor(100000 + Math.random() * 900000)+'-'+Math.floor(100000 + Math.random() * 900000)+'-'+Math.floor(100000 + Math.random() * 900000);
                    response.token = token;
                    responseToSend = {
                        success:1,
                        userData:response,
                    }
                    loggedInUserDetails[response.id] = token;
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
                res.status(500).send(error);
            })
    })
);
skypeCloneRouter.post(
    '/checkPassword',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
        }
        checkPasswordForUser(req.body)
            .then(user => {
                if(user && user.length) {
                    responseToSend = {
                        success:1,
                    }
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
                res.status(500).send(error);
            })
    })
);
skypeCloneRouter.post(
    '/sendOtpToEmailAddress',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {
            success:0,
        }
        checkEmailOfUser(req.body)
            .then(user => {
                if(user && user.length) {
                    const otp = Math.floor(100000 + Math.random() * 900000);
                    responseToSend = {
                        success:1,
                        otp:otp,
                    }

                    const transporter = nodemailer.createTransport({
                        host: "letscall.co.in",
                        port: 465,
                        secure: true,
                        auth: {
                            user: "no-reply@letscall.co.in",
                            pass: "Sunny@Conn1*",
                        },
                        tls: {
                            // do not fail on invalid certs
                            rejectUnauthorized: false,
                        },
                    });
                    const mailOptions = {
                        from: 'no-reply@letscall.com',
                        to: req.body.email,
                        subject: 'Otp verification mail for lets call website',
                        html: `<h1>Welcome</h1><p>This is your one time password <b>${otp}</b></p>`
                    };
                    transporter.sendMail(mailOptions, function(error, info){
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                            console.log('Email id: ' + req.body.email);
                        }
                    });
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
                res.status(500).send(error);
            })
    })
);

skypeCloneRouter.get(
    '/users/:id',
    expressAsyncHandler(async (req, res) => {
        console.log('responseToSend',req.params);
        let responseToSend = {success:0,userData:[]};
        getAllUserData(req.params.id)
            .then(user => {
                if(user && user.length) {
                    let response = user;
                    responseToSend = {
                        success:1,
                        userData:response,
                    }
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

const zoomJWTApiKey = 'Ug1Pl4LAT4SfeyEbgM6UfQ';
const zoomJWTApiSecret = 'NDQsnjHiEc4GrA4uFOtmDmluNOOO0SIK3CdR';
skypeCloneRouter.post(
    '/actionToCreateMeetingApiCall',
    expressAsyncHandler(async (req, res) => {
        const zoomApiUrl = 'https://api.zoom.us/v2/users/mayankdobriyal1920@gmail.com/meetings';
        let token = jwt.sign({iss:zoomJWTApiKey,exp:new Date().getTime() + 10000}, zoomJWTApiSecret);
        let options = {
            method: 'POST',
            uri: zoomApiUrl,
            body:req.body,
            auth:{
                bearer:token
            },
            json: true,
            headers: {
                'User-Agent':'Zoom-api-Jwt-Request',
                'Content-Type': 'application/json',
            },
        }

        request(options,function (error,response){
            if (error) throw new Error(error);
            let responseBody = response?.body;
            res.status(200).send(responseBody);
        })
    })
);
skypeCloneRouter.get(
    '/actionToCreateZakTokenApiCall',
    expressAsyncHandler(async (req, res) => {
        const zoomApiUrl = 'https://api.zoom.us/v2/users/mayankdobriyal1920@gmail.com/token?type=zak';
        let token = jwt.sign({iss:zoomJWTApiKey,exp:new Date().getTime() + 10000}, zoomJWTApiSecret);
        let options = {
            method: 'GET',
            uri: zoomApiUrl,
            auth:{
                bearer:token
            },
            json: true,
            headers: {
                'User-Agent':'Zoom-api-Jwt-Request',
                'Content-Type': 'application/json',
            },
        }

        request(options,function (error,response){
            if (error) throw new Error(error);
            let responseBody = response?.body?.token;
            res.status(200).send(responseBody)
        })
    })
);

skypeCloneRouter.get(
    '/admin-users/:id',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {success:0,userData:[]};
        getAllAdminUserData(req.params.id)
            .then(user => {
                if(user && user.length) {
                    let response = user;
                    responseToSend = {
                        success:1,
                        userData:response,
                    }
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

skypeCloneRouter.post(
    '/insertCommonApiCall',
    expressAsyncHandler(async (req, res) => {
        insertCommonApiCall(req.body).then((data) => {
            res.status(200).send({
                response: data,
            });
        })
            .catch(error => {
                res.status(500).send(error);
            })
    })
);

skypeCloneRouter.post(
    '/updateCommonApiCall',
    expressAsyncHandler(async (req, res) => {
        updateCommonApiCall(req.body).then((data) => {
            res.status(200).send({
                response: data,
            });
        })
            .catch(error => {
                res.status(500).send(error);
            })
    })
);

skypeCloneRouter.post(
    '/deleteCommonApiCall',
    expressAsyncHandler(async (req, res) => {
        deleteCommonApiCall(req.body).then((data) => {
            res.status(200).send({
                response: data,
            });
        })
            .catch(error => {
                res.status(500).send(error);
            })
    })
);
skypeCloneRouter.get(
    '/calllog/:id',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {success:0,callLogData:[]};
        getAllCallLogData(req.params.id)
            .then(calllog => {
                if(calllog && calllog.length) {
                    let response = calllog;
                    responseToSend = {
                        success:1,
                        callLogData:response,
                    }
                    res.status(200).send(responseToSend);
                }else{
                    res.status(200).send(responseToSend);
                }
            }).catch(error => {
            res.status(500).send(error);
        })
    })
);

skypeCloneRouter.get(
    '/room/:id',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {roomData:newMeetingData[req.params.id]};
        res.status(200).send(responseToSend);
    })
);

export default skypeCloneRouter;