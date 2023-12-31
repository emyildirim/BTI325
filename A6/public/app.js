const findByMinPrice = async () => {
    // get the value in the textbox
    const minPriceFromUI = document.querySelector('input').value;
    if (minPriceFromUI === '') {
        document.querySelector("section").innerHTML = "ERROR: You must enter a minimum price!"
        return;
    }

    try {
        const results = await fetch(
            `http://localhost:8080/api/product/min/${minPriceFromUI}`
        );
        const resultsAsJson = await results.json();

        if (resultsAsJson.hasOwnProperty("errMsg") === false) {
            // output the html to the <section>
            let output = ""
            for (const product of resultsAsJson) {
                output += `<div>
                <img src="${product.thumbnail}" alt="${product.description}" />
                <p>${product.title}</p>
                <p>$${product.price}</p>
                </div>
                `
            }
            document.querySelector("section").innerHTML = output
        } else {
            // option 2: No matches found = object with a property called errMsg
            console.log(resultsAsJson)
            // output the html to the <section>
            document.querySelector("section").innerHTML = resultsAsJson.errMsg
        }

    } catch (err) {
        console.log(err);
    }
};

document.querySelector("button").addEventListener("click", findByMinPrice)