const express=require('express')
const app=express()
const bodyParser=require('body-parser')
const MongoClient=require('mongodb').MongoClient
const excel = require('exceljs');


var db;
var s;

MongoClient.connect('mongodb://localhost:27017/mp3', (err, database)=>{
	if(err) return console.log(err)
	db=database.db('mp3')
	app.listen(3000,()=>{
		console.log('Listening at port number 3000')
		
	})
})

app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(express.static('public'))

//Home page
app.get('/', (req,res)=>{
	db.collection('outfits').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('homepage.ejs',{data:result})
	})
})

app.get('/salesdetails', (req,res)=>{
	db.collection('sales').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('salespage.ejs',{data:result})
	})
})

//add product page
app.get('/create', (req,res)=>{
	db.collection('outfits').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('add.ejs',{data:result})
	})
})

app.get('/updatesales', (req,res)=>{
	db.collection('sales').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('updatesales.ejs',{data:result})
	})
})


//update stock page
app.get('/updatestock',(req,res)=>{
	db.collection('outfits').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('update.ejs',{data:result})
	})
})

//delete page
app.get('/deleteproduct',(req,res)=>{
	db.collection('outfits').find().toArray((err,result)=>{
		if(err) return console.log(err)
		res.render('delete.ejs',{data:result})
	})
})

//add new product to collection
app.post('/AddData',(req,res)=>{
	db.collection('outfits').save(req.body,(err,result)=>{
		if(err) return console.log(err)
	console.log('New product added')
	res.redirect('/')
	})
})

app.post('/AddSales',(req,res)=>{
	db.collection('sales').save(req.body,(err,result)=>{
		if(err) return console.log(err)
	console.log('New sales detail added')
	res.redirect('/salesdetails')
	})
})

//update the stock
app.post('/update',(req,res)=>{

	db.collection('outfits').find().toArray((err,result)=>{
		if(err) return console.log(err)
		for(var i=0;i<result.length;i++)
		{
			if(result[i].pid==req.body.id)
			{
				s=result[i].quantity
				break
			}
		}	
		db.collection('outfits').findOneAndUpdate({pid: req.body.id},{
			$set: {quantity: parseInt(s) + parseInt(req.body.nquantity) }},{sort: {_id:-1}},
			(err,result)=>{
				if(err) return res.send(err)
				console.log(req.body.id+'stock updated')
				res.redirect('/')
		})
	})
})

//delete product
app.post('/delete',(req,res)=>{
	db.collection('outfits').findOneAndDelete({pid:req.body.id},(err,result)=>{
		if(err) return console.log(err)
		res.redirect('/')
	})
})

// excel
app.get('/toexcel', (req,res)=>{
	db.collection('sales').find().toArray((err,result)=>{
		if(err) return console.log(err)
		let workbook = new excel.Workbook(); //creating workbook
		let worksheet = workbook.addWorksheet('Sales'); //creating worksheet
		//res.render('homepage.ejs',{data:result})
		//  WorkSheet Header
	worksheet.columns = [
		{ header: 'Date', key: 'pdate', width: 10 },
		{ header: 'ID', key: 'pid', width: 30 },
		{ header: 'Price', key: 'price', width: 30},
		{ header: 'Quantity', key: 'quantity', width: 10, outlineLevel: 1},
		{ header: 'Total Sales', key: 'totsales', width: 30}
	];
	
	// Add Array Rows
	worksheet.addRows(result);
	
	// Write to File
	workbook.xlsx.writeFile("sales.xlsx")
		.then(function() {
			console.log("file saved!");
		});
		res.redirect('/')
	})
})