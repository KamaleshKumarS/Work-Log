const express=require('express')
const bodyParser=require('body-Parser')
const mongoose=require('mongoose')
const cors=require('cors')
const jwt=require('jsonwebtoken')
mongoose.connect('mongodb+srv://kam:kam@cluster0.r6cmb.mongodb.net/?retryWrites=true&w=majority')
const app=express()
const path = __dirname + '/views/';
app.use(express.static(path));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({extended:true}))
app.use(cors())
const FLusersSchema= new mongoose.Schema({
	Name:String,
	email:String,
	password:String,
	contactNumber:String,
	department:String,
	joiningDate:String,
	data:Array
})
const AFLusersSchema=new mongoose.Schema({
	userName:String,
	email:String,
	password:String,
})
const FLusers=new mongoose.model('FLusers',FLusersSchema)
const AFLusers=new mongoose.model('AFLusers',AFLusersSchema)
app.post('/emplogin',async(req,res)=>{
	const email=req.body.email;
	const password=req.body.password;
	//console.log({email,password})
	await FLusers.findOne({email:email,password:password}).then(async(val)=>{
		if (val!=null){
			const token=generateToken(val._id);
			res.json({auth:true,token:token})
		}
		else{
			res.json({auth:true})
		}
	})
})
app.get('/', function (req,res) {
  res.sendFile(path + "index.html");
});
app.post('/admLogin',async(req,res)=>{
	const email=req.body.email;
	const password=req.body.password;
	await AFLusers.findOne({email:email,password:password}).then(async(val)=>{
		if (val!=null){
			const token=generateToken(val._id);
			res.json({auth:true,token:token})
		}
		else{
			res.json({auth:true})
		}
	})
})
app.post('/admregister',async(req,res)=>{
	const username=req.body.name;
	const email=req.body.email;
	const password=req.body.password;
	await AFLusers.findOne({userName:username,email:email}).then(val=>{
		if(val!=null){
			res.json({userCreated:false})
		}
	})
	const adminNew=new AFLusers({
		userName:username,
		email:email,
		password:password
	})
	adminNew.save();
	res.json({userCreated:true})
})
app.get('/getEmployees',async(req,res)=>{
	await FLusers.find({},{Name:1,_id:1}).then(val=>{
		//console.log(val)
		res.json(val)
	})
})
app.post('/admAuth',async(req,res)=>{
	jwt.verify(req.body.token,'secret',async(err,val)=>{
		//console.log({val})
		//console.log('hii')
		if(val!=null){
		await AFLusers.findById(val.id).then(vall=>{
			if(vall==null){
			//console.log({vall})
				res.json({auth:false})
			}
			else{
				res.json({auth:true,id:vall._id})
			}
		})}
		else{
			res.json({auth:false})
		}
		
	})
})
app.post('/empAuth',async(req,res)=>{
	jwt.verify(req.body.token,'secret',async(err,val)=>{
		//console.log(val)
		//console.log('hii')
		if(val!=null){
		await FLusers.findById(val.id).then(vall=>{
			if(vall==null){
				res.json({auth:false})
			}
			else{
				res.json({auth:true,id:vall._id})
			}
		})}
		else{
			res.json({auth:false})
		}
		
	})
})
app.post('/empRegister',async(req,res)=>{
	const employeeNew=new FLusers({
	Name:req.body.name,
	email:req.body.email,
	password:req.body.password,
	contactNumber:req.body.contactNumber,
	department:req.body.department,
	joiningDate:req.body.joinDate,
	})
	employeeNew.save();
	//console.log(employeeNew)
	res.json({
		success:true
	})
})
app.post('/getEmpDetails',async(req,res)=>{
	const empId=req.body.empId
	await FLusers.findById(empId,{ Name:1, email:1, contactNumber:1, department:1, joiningDate:1}).then(val=>{
		if(val==null){
			res.json({
				found:false
			})
		}
		else{
			res.json({found:true,val})
		}
	})
})
app.post('/addTask',async(req,res)=>{
	const {description,type,dateTime,timeTaken,id,date}=req.body;
	//console.log(id)
	await FLusers.findByIdAndUpdate(id,{$push:{data:{
		description:description,
		type:type,
		dateTime:dateTime,
		timeTaken:timeTaken,
		date:date
	}}}
		).then(val=>{
			if(val==null){
				res.json({taskUpdated:false})
			}
			else{
				res.json({taskUpdated:true})
			}
		})
		})
app.post('/getEmpTask',async(req,res)=>{
	const date=new Date().toLocaleDateString()
	const id=req.body.empId;
	await FLusers.findById(id,{data:1}).then(val=>{
		if(val!=null){
			//console.log(val)
			const vel=val.data
			//console.log({vel})
			if (vel[0]!=null){
			const fil=vel.filter(edata=>edata.date==date)
			//console.log({fil})
			res.json({fil})}
			else{
				res.json('nope')
			}}
			else{
				res.json('nope')
			}

})})
const generateToken=(user)=>{
	const token=jwt.sign({id:user},'secret');
	return token
}
app.listen(4000,()=>{
	console.log('listening on 4000')
})