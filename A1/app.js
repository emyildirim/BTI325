const movies = [
    { 
        Name: "Spiderman Across the Spiderverse", 
        Year: 2023, Rating: 4.5
    },
    {
        Name: "A Thousand Words",
        Year: 2012, Rating: 3.1
    },
    {
        Name: "Sly",
        Year: 2023, Rating: 5
    },
    {
        Name: "The Whale",
        Year: 2022, Rating: 4.98
    },
    {
        Name: "Crossover",
        Year: 2006, Rating: 2.22
    },

]

const find = (arr) => {
    let tmp = []
    for(let i = 0; i < arr.length; i++){
        if(arr[i].Rating < 2.0){
            tmp.push(arr[i])
        }
    }

    if(tmp.length == 0){
        console.log("Sorry, no movies found")
    }else{
        for(let i = 0; i < tmp.length; i++){
            console.log(`Name: ${tmp[i].Name}, Star Rating: ${tmp[i].Rating}`)
        }
    }
}

find(movies) 