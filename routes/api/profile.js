const express=require('express')
const router=express.Router()
const auth=require('../../middleware/auth')
const request=require('request')
const config=require('config')
const {check,validationResult}=require('express-validator')
const User=require('../../models/User')
const Profile=require('../../models/Profile')
const Post=require('../../models/Post')
//get current users profile
router.get('/me',auth,async (req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.user.id})
                                    .populate('user',['name','avatar'])

        if(!profile){
          res.status(400).json({msg:'there is no profile for this user'})
        }

       return res.json(profile)
    } catch (error) {
        console.error(error.message)
        return res.status(500).send('Server Error')
    }
})

//Create or update a user profile

router.post('/',[auth,[
    check('status','Status is require')
        .not()
        .isEmpty(),
    check('skills','skills is require')
        .not()
        .isEmpty()
]],async (req,res)=>{
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const {company,website,location,bio,status,githubusername,skills,youtube,facebook,twitter,instagram,linkedin}=req.body

    //Build Profile Object
    const ProfilFields={}
    ProfilFields.user=req.user.id
    if(company) ProfilFields.company=company
    if(website) ProfilFields.website=website
    if(location) ProfilFields.location=location
    if(bio) ProfilFields.bio=bio
    if(status) ProfilFields.status=status
    if(githubusername) ProfilFields.githubusername=githubusername
    if(skills){
        ProfilFields.skills=skills.split(',').map(skill=>skill.trim())
    }

    //Build Social Object
    ProfilFields.social={}
    if(youtube) ProfilFields.social.youtube=youtube
    if(twitter) ProfilFields.social.twitter=twitter
    if(facebook) ProfilFields.social.facebook=facebook
    if(linkedin) ProfilFields.social.linkedin=linkedin
    if(instagram) ProfilFields.social.instagram=instagram

    try {
        let profile=await Profile.findOne({user:req.user.id})
        if(profile){
            //update
            profile=await Profile.findOneAndUpdate(
                {user:req.user.id},
                {$set:ProfilFields},
                {new:true})

                return res.json(profile)
        }

        //Create Profile
        profile=new Profile(ProfilFields)
        await profile.save()
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        res.status(500).send('server Error')
    }

})

//Get All Profile,Public

router.get('/',async (req,res)=>{
    try {
        const profiles=await Profile.find().populate('user',['name','avatar'])
        res.json(profiles)
    } catch (error) {
        console.error(error.message)
        res.status(500).json('Server Error')
    }
})

//get profile by user ID,public
router.get('/user/:user_id',async (req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.params.user_id})
                                    .populate('user',['name','avatar'])
        if(!profile){
            return res.status(400).json({msg:'Profile Not Found'})
        }
        res.json(profile)
    } catch (error) {
        console.error(error.message)
        if(error.kind==='ObjectId'){
            return res.status(400).json({msg:'Profile Not Found'})
        }
        res.status(500).send('Server Error')
    }
})


//Delete Profile,privata
router.delete('/',auth,async (req,res)=>{
    try {

        //Remove User post
        await Post.deleteMany({user:req.user.id})

        //Remove USer profile
        await Profile.findOneAndRemove({user:req.user.id})
        //Remove user
        await User.findOneAndRemove({_id:req.user.id})
        res.json({msg:'User Deleted'})
    } catch (error) {
        console.error(error.message)
        res.status(500).json('Server Error')
    } 
})


//update profile experience,Private

router.put('/experience',[auth,[
    check('title','title is required').not().isEmpty(),
    check('company','Company is required').not().isEmpty(),
    check('from','From Date is required').not().isEmpty()    
]],async (req,res)=>{
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const {
    title,
    company,
    location,
    from,
    to,
    current,
    description
} =req.body
const newExp={
    title,
    company,
    location,
    from,to,
    current,description
}

try {
    const profile=await Profile.findOne({user:req.user.id})
    profile.experience.unshift(newExp)
    await profile.save()

    res.json(profile)
} catch (error) {
    console.error(error.message)

    res.status(500).send('Server Errro')
}

})

//Delete Experience from Profile,Private
router.delete('/experience/:exp_id',auth,async (req,res)=>{
try {
    const profile=await Profile.findOne({user:req.user.id})

    //Get remove index
    const index=profile.experience.map(item=>item.id).indexOf(req.params.exp_id)
    profile.experience.splice(index,1)
    await profile.save()
    res.json(profile)

} catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
}
})

// add Education profile,authed

router.put('/education',[auth,[
    check('school','School is required').not().isEmpty(),
    check('degree','Degree is required').not().isEmpty(),
    check('fieldofstudy','Field of Study is required').not().isEmpty(),
    check('from','From Date is required').not().isEmpty()    
]],async (req,res)=>{
const errors=validationResult(req)
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()})
}
const {
    school,
    degree,
    fieldofstudy,
    from,
    to,
    current,
    description
} =req.body
const newEdu={
    school,
    degree,
    fieldofstudy,
    from,to,
    current,description
}

try {
    const profile=await Profile.findOne({user:req.user.id})
    profile.education.unshift(newEdu)
    await profile.save()

    res.json(profile)
} catch (error) {
    console.error(error.message)

    res.status(500).send('Server Error')
}

})

//Delete Experience from Profile,Private
router.delete('/education/:edu_id',auth,async (req,res)=>{
try {
    const profile=await Profile.findOne({user:req.user.id})

    //Get remove index
    const index=profile.education.map(item=>item.id).indexOf(req.params.edu_id)
    profile.education.splice(index,1)
    await profile.save()
    res.json(profile)

} catch (error) {
    console.error(error.message)
    res.status(500).send('Server Error')
}
})

 
//Get user repose from  Github,public

router.get('/github/:username',async (req,res)=>{
    try {
        const options = {
            uri: `https://api.github.com/users/${
              req.params.username
            }/repos?per_page=5&sort=created:asc&client_id=${config.get(
              'githubClientId'
            )}&client_secret=${config.get('githubSecret')}`,
            method: 'GET',
            headers: { 'user-agent': 'node.js' }
          };
        request(options,(error,response,body)=>{
                if(error) console.error(error)
                if(response.statusCode!==200){
                           return res.status(400).json({msg:'No Github profile Found'})
                }
                res.json(JSON.parse(body))

                
        })
    } catch (error) {
        console.error(error.message)
    res.status(500).send('Server Error')
    }
})
module.exports=router