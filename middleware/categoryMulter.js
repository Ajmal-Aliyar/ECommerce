const multer = require('multer');
const path = require('path');


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './public/assets/images/categoryImage'); 
    },
    filename: function(req, file, cb) {
        
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, 
    fileFilter: function(req, file, cb) {
        console.log(file+"check");
        checkFileType(file, cb);
    }
}).single('categoryImage'); 
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

module.exports = upload;
