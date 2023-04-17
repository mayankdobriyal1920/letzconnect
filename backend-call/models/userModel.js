import pool from './connection.js';
import CryptoJS from "crypto-js";

export const loginUser = (body) => {
    const {email,password} = body;
    return new Promise(function(resolve, reject) {
        pool.query(`SELECT id,name,email,avatar,isAdmin,created_by from app_user WHERE email = ? AND password = ?`,[email,password], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

export const checkPasswordForUser = (body) => {
    const {id,password} = body;
    return new Promise(function(resolve, reject) {
        pool.query(`SELECT id from app_user WHERE id = ? AND password = ?`,[id,password], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}
export const checkEmailOfUser = (body) => {
    const {email} = body;
    return new Promise(function(resolve, reject) {
        pool.query(`SELECT id from app_user WHERE email = ?`,[email], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

export const getAllUserData = (id) => {
    return new Promise(function(resolve, reject) {
        pool.query(`SELECT id,name,email,avatar,isAdmin,created_by from app_user where created_by = ? OR id = ?`,[id,id], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}
export const getAllCallLogData = (id) => {
    return new Promise(function(resolve, reject) {
        pool.query(`SELECT * from call_log where created_by = ? order by created_at DESC`,[id], (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results);
        })
    })
}

export const insertCommonApiCall = (body) => {
    const {column,alias,tableName,values} = body;
    return new Promise(function(resolve, reject) {
        const query =`INSERT INTO ${tableName} (${column.toString()}) VALUES (${alias.toString()})`;
        pool.query(query,values, (error) => {
            if (error) {
                reject(error)
            }
            let data = {success:1};
            resolve(data);
        })
    })
}

export const updateCommonApiCall = (body) => {
    const {column,value,whereCondition,tableName} = body;
    return new Promise(function(resolve, reject) {
        const query = `UPDATE ${tableName} set ${column.toString()} WHERE ${whereCondition}`;
        pool.query(query,value, (error) => {
            if (error) {
                reject(error)
            }
            let data = {success:1};
            resolve(data);
        })
    })
}

export const deleteCommonApiCall = (body) => {
    const {condition,tableName} = body;
    return new Promise(function(resolve, reject) {
        const query = `DELETE FROM ${tableName} WHERE ${condition}`;
        pool.query(query, (error) => {
            if (error) {
                reject(error)
            }
            let data = {success:1};
            resolve(data);
        })
    })
}