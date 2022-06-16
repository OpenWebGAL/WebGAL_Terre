const express = require('express');
const getFilelistByDir = require("../../service/getFilelistByDir");
const getAssets = express.Router();

getAssets.post('/*', async (req, res) => {
    const props = req.body;
    const dir = props.dir;
    const data = await getFilelistByDir(dir);
    res.send(data);
})

module.exports = getAssets;