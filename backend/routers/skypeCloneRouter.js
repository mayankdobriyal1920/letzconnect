import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import nodemailer  from 'nodemailer';
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
                        host: "letzconnects.com",
                        port: 465,
                        secure: true,
                        auth: {
                            user: "no-reply@letzconnects.com",
                            pass: "Sunny@Conn1*",
                        },
                        tls: {
                            // do not fail on invalid certs
                            rejectUnauthorized: false,
                        },
                    });
                    const mailOptions = {
                        from: 'no-reply@letzconnects.com',
                        to: req.body.email,
                        subject: 'Otp verification mail for letz connects website',
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