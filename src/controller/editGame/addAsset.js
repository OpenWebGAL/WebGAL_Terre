const express = require('express');
const addAsset = express.Router();
const multer = require('multer');
const uploadFile = require("../../service/uploadFile");
const upload = multer({ dest: './uploads/' })

addAsset.post('/*', upload.single('file'),async (req, res) => {
    const fileObject = req.file;
    const result = await uploadFile(fileObject.originalname, req.body.dir, fileObject.destination + fileObject.filename)
    res.send(result);
})

module.exports = addAsset;