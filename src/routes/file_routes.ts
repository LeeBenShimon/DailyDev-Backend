import express from 'express';
const router = express.Router();
import multer from "multer";

const base = "http://" + process.env.DOMAIN_BASE + ":" + process.env.PORT + "/";
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split(' ')
            .filter(Boolean) // Remove empty extensions (e.g. 'filename...txt)
            .slice(1)
            .join(' ')
            cb(null, Date.now() + "." + ext)
    }
})
const upload = multer({ storage: storage });

router.post('/', upload.single("file"), function (req, res) {
    if (req.file) {
        console.log("router.post(/file: " + base + req.file.path)
        res.status(200).send({ url: base + req.file.path })
    } else {
        res.status(400).send({ error: "File upload failed" })
    }
});
export = router;