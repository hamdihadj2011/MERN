const express=require('express')
const router=express.Router()
const {check,validationResult} =require('express-validator')

const auth=require('../../middleware/auth')
const User=require('../../models/User')
const Post=require('../../models/Post')
const Profile=require('../../models/Profile')

//Create a post,private
router.post('/',[auth,[
    check('text','Text is Required').not().isEmpty()
]],async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   try {
    const user=await User.findById(req.user.id).select('-password')
    const newPost=new Post({
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    })
    const post =await newPost.save()
    res.json(post)

   } catch (error) {
       console.error(error.message)
       res.status(500).send('Server Error')
   }
})


//get posts,private
router.get('/',auth,async (req,res)=>{
    try {
        const posts=await Post.find().sort({date:-1})
        res.json(posts)
    } catch (error) {
        console.error(error.message)
       res.status(500).send('Server Error')
    }
})

//get post by id,authed

//get posts,private
router.get('/:id',auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post) return res.status(404).json({msg:'Post Not Found'})
        res.json(post)
    } catch (error) {
        console.error(error.message)
        if(error.kind==='ObjectId') return res.status(404).json({msg:'Post Not Found'})
       res.status(500).send('Server Error')
    }
})

//Delet post ,private
router.delete('/:id',auth,async (req,res)=>{
    try {
        const post=await Post.findById(req.params.id)
        if(!post) return res.status(404).json({msg:'Post Not Found'})
        //Check on the Owner of the post
        if(post.user.toString() !==req.user.id) return res.status(401).json({msg:'USer not Authorized'})

        await post.remove()
        res.json({msg:'Post Removed'})
    } catch (error) {
        console.error(error.message)
        if(error.kind==='ObjectId') return res.status(404).json({msg:'Post Not Found'})
       res.status(500).send('Server Error')
    }
})

//put request private

router.put('/like/:id',auth,async (req,res)=>{
    try {
        const post =await Post.findById(req.params.id)

        //check the post has already been liked

        if(post.likes.filter(like=> like.user.toString()===req.user.id).length > 0){
                return res.status(400).json({msg:'Post already liked by you'})
        }
        post.likes.unshift({user:req.user.id})

        await post.save()

        res.json(post.likes)

    } catch (error) {
        console.error(error.message)
        // if(error.kind==='ObjectId') return res.status(404).json({msg:'Post Not Found'})
       res.status(500).send('Server Error')
    }
})
//unlike post,private

router.put('/unlike/:id',auth,async (req,res)=>{
    try {
        const post =await Post.findById(req.params.id)

        //check the post has already been liked

        if(post.likes.filter(like=> like.user.toString()===req.user.id).length === 0){
                return res.status(400).json({msg:'Post has not been yet liked'})
        }
        const removeIndex=post.likes.map(like=>like.user.toString()).indexOf(req.user.id)

        post.likes.splice(removeIndex,1)

        await post.save()

        res.json(post.likes)

    } catch (error) {
        console.error(error.message)
        // if(error.kind==='ObjectId') return res.status(404).json({msg:'Post Not Found'})
       res.status(500).send('Server Error')
    }
})


//Post Comments,Private

router.post('/comment/:id',[auth,[
    check('text','Text is Required').not().isEmpty()
]],async (req,res)=>{
    const errors=validationResult(req)
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()})
    }
   try {
    const user=await User.findById(req.user.id).select('-password')
    const post=await Post.findById(req.params.id)
    const newComment={
        text:req.body.text,
        name:user.name,
        avatar:user.avatar,
        user:req.user.id
    }
    
    post.comments.unshift(newComment)
    await post.save()
    res.json(post.comments)

   } catch (error) {
       console.error(error.message)
       res.status(500).send('Server Error')
   }
})

//Delete a comment,private

router.delete('/comment/:id/:comment_id',auth,async (req,res)=>{
    
   try {
    
    const post=await Post.findById(req.params.id)
    //get comment from post
    const comment=post.comments.find(comment=>comment.id===req.params.comment_id)
    //Make Sure Comment exist
    if(!comment){
        return res.status(404).json({msg:'Commentdoes not exist'})
    }
    //check the user who delete the comment is the owner of comment

    if(comment.user.toString()!==req.user.id){
        return res.status(401).json({msg:'User not Authorized'})
    }

    //Find the index of comment

    const removeIndex=post.comments.map(comment=>comment.user.toString()).indexOf(req.user.id)

        post.comments.splice(removeIndex,1)

        await post.save()

        res.json(post.comments)

    

   } catch (error) {
       console.error(error.message)
       res.status(500).send('Server Error')
   }
})
module.exports=router