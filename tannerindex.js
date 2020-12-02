app.get('/search', async (req, res) =>{
    let searchPage = req.query.search;
    const db = await dbPromise;
    const search = await db.all('SELECT loan_name, init_currency, interest_rate, loan_amount, loan_type, loan_term FROM Loan', searchPage);
    console.log(search);
    res.render("search", { search });
})
