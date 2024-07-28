const Category = require('../model/categoryModel')

const categories = async (req, res) => {
    try {
        const categoryData = await Category.find({})
        res.render('categories', { categoryData })
    } catch (err) {
        console.log(err);
    }
}

const addCategoryPage = async (req, res) => {
    try {

        res.render('addCategory')
    } catch (error) {
        console.error(error.message);
    }
}

const addCategory = async (req, res) => {
    try {
        let { categoryName } = req.body;

        const alreadyExist = await Category.find({
            categoryName: { $regex: new RegExp("^" + categoryName + "$", "i") }
        });
        console.log(alreadyExist);
        if (alreadyExist.length>0) {
            res.render('addCategory', { message: "category already exists" })
        } else {
            const categoryImage = '/assets/images/categoryImage/' + req.file.filename;
            const category = new Category({
                categoryName,
                categoryImage
            });

            await category.save();

            const categoryData = await Category.find({})
            res.redirect('categories')
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server Error' });
    }
}
const editCategory = async (req, res) => {
    try {
        const id = req.query.id
        console.log(id);
        const data = await Category.findOne({ _id: id })
        console.log(data);
        res.render('editCategory', { data })
    } catch (error) {
        console.error(error);
    }
}

const updateCategory = async (req, res) => {
    try {
        console.log(req.body)
        const { id, categoryName } = req.body
        if (req.file) {
            const pathfile = "/assets/images/categoryImage/" + req.file.filename
            const data = await Category.updateOne({ _id: id },
                {
                    $set: {
                        categoryImage: [pathfile],
                        categoryName: categoryName
                    }
                }
            );
        } else {

            const data = await Category.updateOne({ _id: id }, { $set: { categoryName: categoryName } })
        }
        res.redirect('/admin/categories')
    } catch (error) {
        console.error(error.message);
    }
}
const categoryRestrict = async (req, res) => {
    try {
        const id = req.body.id
        const data = await Category.updateOne({ _id: id }, { $set: { isBlocked: true } })
        res.status(200).json({ data })
    } catch (error) {
        console.error(error.message);
    }
}
const categoryUnrestrict = async (req, res) => {
    try {
        const id = req.body.id
        const data = await Category.updateOne({ _id: id }, { $set: { isBlocked: false } })
        res.status(200).json({ data })

    } catch (error) {
        console.error(error.message);
    }
}
const deleteCategory = async (req, res) => {
    const id = req.body.id
    const data = await Category.deleteOne({ _id: id })
    res.status(200).json({ data })
}
module.exports = {
    addCategoryPage, addCategory, categories, editCategory, updateCategory, categoryRestrict, categoryUnrestrict,
    deleteCategory
}