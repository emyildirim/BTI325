const express = require("express")
const app = express()
const HTTP_PORT = process.env.PORT || 8080


// configure a folder for external css stylesheets and images
app.use(express.static("assets"))

// configure ejs
app.set("view engine", "ejs")

// receive data from a <form>
app.use(express.urlencoded({ extended: true }))


/// --------------
// DATABASE : Connecting to database and setting up your schemas/models (tables)
/// --------------

const mongoose = require("mongoose")

const CONNECTION_STRING = "mongodb+srv://dbUser:Y0OSvUvnvIbUmNRO@cluster0.g281hol.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(CONNECTION_STRING);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error connecting to database: "));
db.once("open", () => { console.log("Mongo DB connected successfully."); });


// define the schemas and models

// schemas
const Schema = mongoose.Schema
const ParkingLotsSchema = new Schema({ name:String, hourlyRate:Number, maxRate:Number })
const CarsSchema = new Schema({ licensePlate:String, model:String, parkingLot:String, hours:Number, paid:Number })


// models - create collection if not exist and select it
const ParkingLot = mongoose.model("parkinglots", ParkingLotsSchema)
const Car = mongoose.model("cars", CarsSchema)


// ----------------
// endpoints
// ----------------

//HOME PAGE
app.get("/", async (req, res) => {
    try{
        const results = await ParkingLot.find().lean().exec()
        res.render("home", {results:results})
    }catch(err){
        console.log(err)
    }
})

app.post("/search", async (req, res) => {
    try {
        const result = await Car.findOne({ licensePlate: req.body.searched }).lean().exec()
        console.log(result)
        if(result === null){
            res.send("No car found!")
        }else{
            res.send(`Model: ${result.model}
            <br>License Plate: ${result.licensePlate}
            <br>Parking Lot: ${result.parkingLot}
            <br>paid $${result.paid} for ${result.hours} hours`)
        }
    } catch (err) {
        console.log(err)
    }
})

//ADMIN PAGE
app.get("/admin", async (req, res) => {
    try {
        const resultParkingLot = await ParkingLot.find().lean().exec()

        //custom array to store cars that belongs to parking lots
        const array = []
        let grandTotalFee = 0

        for (const parkingLot of resultParkingLot) {
            const resultCars = await Car.find({ parkingLot: parkingLot.name })

            //calculate the total fees for the parking lots
            let totalFee = 0
            for (const car of resultCars){
                totalFee += car.paid 
            }
            grandTotalFee += totalFee

            //construct the objects that go in the array
            const obj = {
                parkingLot,
                cars: resultCars,
                totalFee: totalFee
            }

            //add the results to the custom array
            array.push(obj)
        }
        res.render("admin", { results: array, allFees:grandTotalFee })
    } catch (err) {
        console.log(err)
    }
})


app.post("/purchase", async (req, res) => {
    try {

        //get the values from UI
        const parkingLotFromUI = req.body.parkingLot
        const carModelFromUI = req.body.model
        const licensePlateFromUI = req.body.license
        let hoursFromUI = parseInt(req.body.hours)
        let paid = 0

        const resultParkingLot = await ParkingLot.findOne({ name: parkingLotFromUI })
        const resultCar = await Car.findOne({ licensePlate: licensePlateFromUI })

        //if the car is not parked yet
        if(resultCar === null){
            //calculate and set the payment
            if (resultParkingLot.hourlyRate * hoursFromUI <= resultParkingLot.maxRate) {
                paid = resultParkingLot.hourlyRate * hoursFromUI
            } else {
                paid = resultParkingLot.maxRate
            }

            // create a new document
            const carObj = new Car(
                {
                    licensePlate: licensePlateFromUI,
                    model: carModelFromUI,
                    parkingLot: parkingLotFromUI,
                    hours: hoursFromUI,
                    paid: paid
                }
            )

            // insert the document into the collection
            await carObj.save()
            res.send("Purchase Successful!")
        }else if (!(resultCar.parkingLot === parkingLotFromUI)){

            res.send("ERROR: The car already parked in a different parking lot!")

        }else{

            //update the hours
            hoursFromUI = hoursFromUI + resultCar.hours

            //calculate and set the payment
            if (resultParkingLot.hourlyRate * (hoursFromUI) <= resultParkingLot.maxRate) {
                paid = resultParkingLot.hourlyRate * (hoursFromUI)
            } else {
                paid = resultParkingLot.maxRate
            }
            
            console.log(`new paid: ${paid}`)
            //update the already existed car
            await Car.updateOne({ licensePlate: licensePlateFromUI }, { $set: {hours: hoursFromUI, paid: paid}})
            res.send("Purchase Completed!")
        }
    }catch(err){
        console.log(err)
    } 
})


// ----------------
const onHttpStart = () => {
    console.log(`Express web server running on port: ${HTTP_PORT}`)
    console.log(`Press CTRL+C to exit`)
}
app.listen(HTTP_PORT, onHttpStart)
