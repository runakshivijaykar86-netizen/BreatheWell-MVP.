const sql = require('mssql');

module.exports = async function (context, req) {
    // 1. Get the connection string from Azure settings
    const config = process.env.DB_CONNECTION_STRING;

    try {
        // 2. Grab the name and email you sent from the frontend
        const { name, email } = req.body;

        // 3. Connect to SQL
        let pool = await sql.connect(config);

        // 4. Run the SQL Command to save the data
        await pool.request()
            .input('name', sql.NVarChar, name)
            .input('email', sql.NVarChar, email)
            .query('INSERT INTO Users (Name, Email) VALUES (@name, @email)');

        context.res = {
            status: 200,
            body: { success: true }
        };
    } catch (err) {
        context.res = {
            status: 500,
            body: { success: false, error: err.message }
        };
    }
};
