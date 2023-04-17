import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import {newRoomCreatedCustomApi, newRoomCreatedCustomApiMembers} from "../server.js";
const callRouter = express.Router();

callRouter.get(
    '/room/:id',
    expressAsyncHandler(async (req, res) => {
        let responseToSend = {roomData:newRoomCreatedCustomApi[req.params.id],allowedMembers:newRoomCreatedCustomApiMembers[req.params.id]};
        res.status(200).send(responseToSend);
    })
);

export default callRouter;