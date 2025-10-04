const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function(_req, _file, cb) {
        cb(null, './public/assets/images/productImage'); 
    },
    filename: function(req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadProduct = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: function(_req, file, cb) {
        checkFileType(file, cb);
    }
}).array('productImage[]', 5); // Expect multiple files under the same field name as an array

function checkFileType(file, cb) {
    const filetypes = /jpeg|jpg|webp|png|avif|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}

module.exports = uploadProduct;
