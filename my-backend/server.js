require('dotenv').config();
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;

const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Ensure this line is correct

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../my-frontend/build')));


//app.use(express.static(path.join(__dirname, 'client/build')));

// Database configuration
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true, // Necessary for Azure SQL
    enableArithAbort: true,
    connectionTimeout: 30000000,  // Increase the connection timeout
    requestTimeout: 30000000,
    trustServerCertificate: true 
  }
};
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({ storage: storage });

// Attempt to connect and execute a test query
sql.connect(config).then(pool => {
  console.log('Connected to the Azure SQL Database');
  return pool.query('SELECT 1 as number');
}).then(result => {
  console.log('Test query successful:', result.recordset);
}).catch(err => {
  console.error('Database connection error:', err);
});

// Start server

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
app.use((req, res, next) => {
  console.log(`Received request: ${req.method} ${req.url}`);
  next();
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled application error:', error);
  res.status(500).send('Something broke!');
});
//app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all route to serve the React app
//app.get('*', (req, res) => {
  //res.sendFile(path.join(__dirname, '../my-frontend/build', 'index.html'));
//});
app.post('/signup', async (req, res) => {
  console.log('Received signup data:', req.body);
  const { clientName, email, phone, password, address, city, country, zip } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('clientName', sql.NVarChar, clientName)
      .input('email', sql.NVarChar, email)
      .input('phone', sql.NVarChar, phone)
      .input('password', sql.NVarChar, password)
      .input('address', sql.NVarChar, address)
      .input('city', sql.NVarChar, city)
      .input('country', sql.NVarChar, country)
      .input('zip', sql.NVarChar, zip)
      .input('userRole', sql.NVarChar, 'user')
      .query('INSERT INTO Users (ClientName, Email, Phone, Password, Address, City, Country, Zip, UserRole) VALUES (@clientName, @email, @phone, @password, @address, @city, @country, @zip, @userRole)');

    console.log('Insert query successful:', result);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).json({ message: 'Failed to register user', error: err.message });
  }
});

app.post('/signin', async (req, res) => {
  console.log('Received signin data:', req.body);
  const { email, password } = req.body;

  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('password', sql.NVarChar, password)
      .query('SELECT UserId, ClientName, UserRole FROM Users WHERE Email = @email AND Password = @password');

    if (result.recordset.length > 0) {
      const user = result.recordset[0];
      console.log('Signin successful:', user);
      res.status(200).json({
        message: 'User authenticated successfully',
        userId: user.UserId,
        clientName: user.ClientName,
        userRole: user.UserRole
      });
    } else {
      console.log('Signin failed: User not found or password does not match');
      res.status(401).send('Authentication failed');
    }
  } catch (err) {
    console.error('SQL error:', err);
    res.status(500).send('Internal server error');
  }
});

// server.js (or equivalent server setup file)
app.get('/products', async (req, res) => {
  console.log('Received request for products');
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM Products');
    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching products:', err);
    res.status(500).json({ message: 'Error fetching products' });
  }
});
app.get('/products/search', async (req, res) => {
  const { query } = req.query;

  console.log(`Received request to fetch product with query: ${query}`);

  try {
    const pool = await sql.connect(config);
    console.log('Connected to SQL server.');

    let result;
    if (/^\d{12,13}$/.test(query)) {
      // Assuming barcodes are numeric and 12-13 digits long
      console.log(`Searching by barcode: ${query}`);
      result = await pool.request()
        .input('query', sql.VarChar, query)
        .query('SELECT * FROM Products WHERE Upc = @query');
    } else {
      console.log(`Searching by product name: ${query}`);
      result = await pool.request()
        .input('query', sql.VarChar, `%${query}%`)
        .query('SELECT * FROM Products WHERE Product_Name LIKE @query');
    }

    if (result.recordset.length > 0) {
      console.log('Product found:', result.recordset[0]);
      res.status(200).json(result.recordset[0]); // Return the first matching product
    } else {
      console.log('Product not found.');
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('SQL error while fetching product:', err);
    res.status(500).json({ message: 'Error fetching product' });
  }
});
app.post('/scannedinventory', async (req, res) => {
  const { store, product, sku, count } = req.body;

  if (!store || !product || !sku || !count) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Insert data into the scannedinventory table
    const result = await pool.request()
      .input('store_name', sql.NVarChar, store)
      .input('product_sku', sql.NVarChar, sku)
      .input('product_name', sql.NVarChar, product)
      .input('count', sql.Int, count)
      .query(`
        INSERT INTO scannedinventory (store_name, product_sku, product_name, count)
        VALUES (@store_name, @product_sku, @product_name, @count)
      `);

    res.status(201).json({ message: 'Data saved successfully' });

  } catch (error) {
    console.error('Error saving scanned inventory data:', error);
    res.status(500).json({ message: 'An error occurred while saving data' });
  }
});
// app.get('/scannedinventory/last', async (req, res) => {
//   const { barcode, store } = req.query;

//   if (!barcode || !store) {
//     return res.status(400).json({ message: 'Barcode and store are required' });
//   }

//   try {
//     // Connect to the database
//     const pool = await sql.connect(config);

//     // Query the latest scanned count for the given store and barcode
//     const result = await pool.request()
//       .input('store_name', sql.NVarChar, store)
//       .input('barcode', sql.NVarChar, barcode)
//       .query(`
//         SELECT TOP 1 count
//         FROM scannedinventory
//         WHERE store_name = @store_name AND product_sku = @barcode
//         ORDER BY id DESC
//       `);

//     if (result.recordset.length > 0) {
//       const lastScannedCount = result.recordset[0].count;
//       res.status(200).json({ count: lastScannedCount });
//     } else {
//       res.status(404).json({ message: 'No records found for this store and barcode' });
//     }

//   } catch (error) {
//     console.error('Error fetching last scanned count:', error);
//     res.status(500).json({ message: 'An error occurred while fetching the last scanned count' });
//   }
// });
app.get('/scannedinventory/last', async (req, res) => {
  const { sku, store } = req.query;

  if (!sku || !store) {
    return res.status(400).json({ message: 'SKU and store are required' });
  }

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Query the latest scanned count for the given store and sku
    const result = await pool.request()
      .input('store_name', sql.NVarChar, store)
      .input('product_sku', sql.NVarChar, sku)
      .query(`
        SELECT TOP 1 count
        FROM scannedinventory
        WHERE store_name = @store_name AND product_sku = @product_sku
        ORDER BY id DESC
      `);

    if (result.recordset.length > 0) {
      const lastScannedCount = result.recordset[0].count;
      res.status(200).json({ count: lastScannedCount });
    } else {
      res.status(404).json({ message: 'No records found for this store and SKU' });
    }

  } catch (error) {
    console.error('Error fetching last scanned count:', error);
    res.status(500).json({ message: 'An error occurred while fetching the last scanned count' });
  }
});

// Endpoint to get all scanned inventory data or filter by store and timestamp
app.get('/scannedinventory', async (req, res) => {
  const { store, startDate, endDate } = req.query;

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    let query = 'SELECT * FROM scannedinventory WHERE 1=1';

    if (store) {
      query += ' AND store_name = @store_name';
    }

    if (startDate) {
      query += ' AND scanned_at >= @startDate';
    }

    if (endDate) {
      query += ' AND scanned_at <= @endDate';
    }

    const request = pool.request();

    if (store) {
      request.input('store_name', sql.NVarChar, store);
    }

    if (startDate) {
      request.input('startDate', sql.DateTime2, new Date(startDate));
    }

    if (endDate) {
      request.input('endDate', sql.DateTime2, new Date(endDate));
    }

    const result = await request.query(query);
    res.status(200).json(result.recordset);

  } catch (error) {
    console.error('Error fetching scanned inventory data:', error);
    res.status(500).json({ message: 'An error occurred while fetching data' });
  }
});

// Endpoint to add a new product to the Products table
app.post('/products', async (req, res) => {
  const { Product_Name, sku, Upc, Brand, description_ } = req.body;

  // Validate the required fields
  if (!Product_Name || !sku || !Upc || !Brand || !description_) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Connect to the database
    const pool = await sql.connect(config);

    // Insert data into the Products table
    const result = await pool.request()
      .input('Product_Name', sql.NVarChar, Product_Name)
      .input('sku', sql.NVarChar, sku)
      .input('Upc', sql.NVarChar, Upc)
      .input('Brand', sql.NVarChar, Brand)
      .input('description_', sql.NVarChar, description_)
      // You can add hardcoded values here for the remaining fields if needed
      .input('img', sql.NVarChar, '') // Assuming you don't have an image for now
      .input('price', sql.Float, 0) // Hardcoded price value
      .input('quantity_on_hand', sql.Float, 0) // Hardcoded quantity on hand value
      .input('ItemType', sql.NVarChar, 'Unknown') // Hardcoded item type value
      .query(`
        INSERT INTO Products (Product_Name, sku, Upc, Brand, description_, img, price, quantity_on_hand, ItemType)
        VALUES (@Product_Name, @sku, @Upc, @Brand, @description_, @img, @price, @quantity_on_hand, @ItemType)
      `);

    res.status(201).json({ message: 'Product added successfully' });

  } catch (error) {
    console.error('Error adding new product:', error);
    res.status(500).json({ message: 'An error occurred while adding the product' });
  }
});


app.get('/employee/customers', async (req, res) => {
  try {
      await sql.connect(config);
      const result = await sql.query(`
          SELECT 
              u.UserId,
              u.ClientName AS Name,
              u.Email,
              u.Phone,
              u.Address + ', ' + u.City + ', ' + u.Country + ', ' + u.Zip AS FullAddress,
              COUNT(DISTINCT CASE WHEN o.OrderSentStatus = 1 AND (o.OrderStatus = 'processing' OR o.OrderStatus IS NULL) THEN o.OrderId ELSE NULL END) AS CurrentOrders,
              COUNT(DISTINCT CASE WHEN o.OrderSentStatus = 1 AND o.OrderStatus = 'fulfilled' THEN o.OrderId ELSE NULL END) AS FulfilledOrders
          FROM 
              dbo.Users AS u
          LEFT JOIN 
              dbo.Orders AS o ON u.ClientName = o.Added_by
          WHERE 
              u.UserRole = 'user'
          GROUP BY 
              u.UserId, u.ClientName, u.Email, u.Phone, u.Address, u.City, u.Country, u.Zip
      `);
      res.json(result.recordset);
  } catch (err) {
      console.error('Error on SQL execution:', err);
      res.status(500).send('Failed to retrieve customers and their orders');
  }
});

// app.get('/employee/orders/:clientName/:orderType', async (req, res) => {
//   const { clientName, orderType } = req.params;
//   const orderStatusCondition = orderType === 'current'
//       ? "(o.OrderStatus = 'processing' OR o.OrderStatus IS NULL)"
//       : "o.OrderStatus = 'fulfilled'";
  
//   console.log(`Fetching orders for client: ${clientName}, order type: ${orderType}`);
//   console.log(`Order status condition: ${orderStatusCondition}`);

//   try {
//       await sql.connect(config);
//       const query = `
//           SELECT 
//               o.OrderId,
//               o.Product_Name,
//               o.Quantity,
//               o.OrderStatus,
//               o.OrderSentDate,
//               o.FulfilledDate
//           FROM 
//               dbo.Orders AS o
//           WHERE 
//               o.Added_by = @clientName
//               AND o.OrderSentStatus = 1
//               AND ${orderStatusCondition}
//       `;
//       console.log(`Executing query: ${query}`);
//       const result = await sql.query(query, {
//           input: ['clientName', sql.NVarChar, clientName]
//       });
//       console.log('Query result:', result.recordset);
//       res.json(result.recordset);
//   } catch (err) {
//       console.error('Error on SQL execution:', err);
//       res.status(500).send('Failed to retrieve orders for the client');
//   }
// });
app.get('/employee/orders/:clientName/:orderType', async (req, res) => {
  const { clientName, orderType } = req.params;
  const orderStatusCondition = orderType === 'current'
      ? "(o.OrderStatus = 'processing' OR o.OrderStatus IS NULL)"
      : "o.OrderStatus = 'fulfilled'";
  
  console.log(`Fetching orders for client: ${clientName}, order type: ${orderType}`);
  console.log(`Order status condition: ${orderStatusCondition}`);

  try {
      await sql.connect(config);
      const query = `
          SELECT 
              o.OrderId,
              o.OrderStatus,
              COUNT(o.OrderItemId) as OrderItemCount
          FROM 
              dbo.Orders AS o
          WHERE 
              o.Added_by = @clientName
              AND o.OrderSentStatus = 1
              AND ${orderStatusCondition}
          GROUP BY
              o.OrderId, o.OrderStatus
      `;
      const request = new sql.Request();
      request.input('clientName', sql.NVarChar, clientName);
      const result = await request.query(query);
      console.log('Query result:', result.recordset);
      res.json(result.recordset);
  } catch (err) {
      console.error('Error on SQL execution:', err);
      res.status(500).send('Failed to retrieve orders for the client');
  }
});

// API Endpoint for specific order details
// app.get('/employee/orders/:orderId/details', async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     console.log(`Fetching details for order ID: ${orderId}`); // Debug log

//     const pool = await sql.connect(config);
//     const result = await pool.request()
//       .input('OrderID', sql.Int, orderId)
//       .query('SELECT OrderId, OrderItemID, Sku, Product_Name, Quantity, OrderStatus, OrderSentDate, FulfilledDate FROM Orders WHERE OrderID = @OrderID');

//     console.log('Query result:', result.recordset); // Debug log
//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error('SQL error while fetching order details:', err);
//     res.status(500).json({ message: 'Error fetching order details' });
//   }
// });
app.get('/employee/orders/:orderId/details', async (req, res) => {
  try {
    const { orderId } = req.params;
    console.log(`Fetching details for order ID: ${orderId}`); // Debug log

    // Database connection
    const pool = await sql.connect(config);
    console.log('Database connection established successfully'); // Debug log

    try {
      const result = await pool.request()
        .input('OrderID', sql.Int, orderId)
        .query('SELECT * FROM Orders WHERE OrderID = @OrderID');

      console.log('SQL query executed successfully'); // Debug log
      console.log('Number of rows returned:', result.recordset.length); // Debug log

      if (result.recordset.length === 0) {
        console.log('No records found for the given OrderID'); // Debug log
        res.status(404).json({ message: 'No order details found for the given Order ID' });
      } else {
        res.status(200).json(result.recordset);
      }
    } catch (queryError) {
      console.error('Error executing SQL query:', queryError);
      res.status(500).json({ message: 'Error fetching order details' });
    }

  } catch (err) {
    console.error('SQL error while fetching order details:', err.stack); // Detailed error log
    res.status(500).json({ message: 'Error fetching order details' });
  }
});











// // server.js (or equivalent server setup file)
// app.get('/employee/customers/:addedBy/current-orders', async (req, res) => {
//   const { addedBy } = req.params;
//   console.log(`Fetching current orders for addedBy: ${addedBy}`);
//   try {
//     const pool = await sql.connect(config);
//     console.log('Database connection established.');
//     const result = await pool.request()
//       .input('AddedBy', sql.VarChar, addedBy)
//       .query(`
//         SELECT COUNT(DISTINCT OrderID) AS CurrentOrdersCount 
//         FROM dbo.Orders 
//         WHERE Added_by = @AddedBy AND OrderSentStatus = 1 AND (OrderStatus = '' OR OrderStatus = 'processing')
//       `);
//     console.log('Query executed successfully:', result.recordset);
//     res.json(result.recordset[0]);
//   } catch (err) {
//     console.error('SQL error while fetching current orders count:', err);
//     res.status(500).json({ message: 'Error fetching current orders count' });
//   }
// });

// app.get('/employee/customers/:addedBy/fulfilled-orders', async (req, res) => {
//   const { addedBy } = req.params;
//   console.log(`Fetching fulfilled orders for addedBy: ${addedBy}`);
//   try {
//     const pool = await sql.connect(config);
//     console.log('Database connection established.');
//     const result = await pool.request()
//       .input('AddedBy', sql.VarChar, addedBy)
//       .query(`
//         SELECT COUNT(DISTINCT OrderID) AS FulfilledOrdersCount 
//         FROM dbo.Orders 
//         WHERE Added_by = @AddedBy AND OrderStatus = 'fulfilled'
//       `);
//     console.log('Query executed successfully:', result.recordset);
//     res.json(result.recordset[0]);
//   } catch (err) {
//     console.error('SQL error while fetching fulfilled orders count:', err);
//     res.status(500).json({ message: 'Error fetching fulfilled orders count' });
//   }
// });



app.get('/user/main/previous-orders/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Username', sql.VarChar, username)
      .query('SELECT DISTINCT OrderID, OrderSentDate FROM Orders WHERE added_by = @Username AND OrderSentStatus = 1 AND OrderStatus = \'fulfilled\'');

    if (result.recordset.length > 0) {
        res.json(result.recordset);
    } else {
        res.status(404).send('No previous orders found');
    }
  } catch (err) {
    console.error('SQL error while fetching previous orders:', err);
    res.status(500).send('Error fetching previous orders');
  }
});


app.get('/user/main/order-details/:orderId', async (req, res) => {
  try {
    const orderId = req.params.orderId;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .query('SELECT * FROM Orders WHERE OrderID = @OrderID AND OrderSentStatus = 1 AND OrderStatus = \'fulfilled\'');

    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching order details:', err);
    res.status(500).json({ message: 'Error fetching order details' });
  }
});


app.post('/user/main/repeat-order/:orderId', async (req, res) => {
  const { orderId } = req.params;
  let transaction;
  try {
      const pool = await sql.connect(config);
      transaction = new sql.Transaction(pool);
      await transaction.begin();

      // Fetch existing order details
      const orderDetailsRequest = new sql.Request(transaction);
      orderDetailsRequest.input('OrderID', sql.Int, orderId);
      const orderDetails = await orderDetailsRequest.query('SELECT * FROM Orders WHERE OrderID = @OrderID');

      if (orderDetails.recordset.length === 0) {
          await transaction.rollback();
          return res.status(404).send('Original order not found.');
      }

      // Check if there are pending orders for the user
      const userOrderIDRequest = new sql.Request(transaction);
      const result = await userOrderIDRequest
          .input('AddedBy', sql.VarChar, orderDetails.recordset[0].Added_by)
          .query('SELECT OrderID FROM Orders WHERE Added_by = @AddedBy AND OrderSentStatus = 0');

      let newOrderId;
      if (result.recordset.length > 0) {
          // Use the existing pending OrderID
          newOrderId = result.recordset[0].OrderID;
      } else {
          // Generate a new Order ID
          const newOrderIdRequest = new sql.Request(transaction);
          const newOrderIdResult = await newOrderIdRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 as NewOrderID FROM Orders');
          newOrderId = newOrderIdResult.recordset[0].NewOrderID;
      }

      // Get the next OrderItemID for the new order
      const orderItemIdRequest = new sql.Request(transaction);
      const orderItemIdResult = await orderItemIdRequest
          .input('NewOrderID', sql.Int, newOrderId)
          .query('SELECT ISNULL(MAX(OrderItemID), 0) + 1 as NewOrderItemID FROM Orders WHERE OrderID = @NewOrderID');
      let orderItemId = orderItemIdResult.recordset[0].NewOrderItemID;

      // Insert new order items with the new Order ID
      for (let item of orderDetails.recordset) {
          const insertRequest = new sql.Request(transaction);
          await insertRequest.input('NewOrderID', sql.Int, newOrderId)
              .input('OrderItemID', sql.Int, orderItemId)
              .input('Sku', sql.VarChar, item.Sku)
              .input('ProductName', sql.VarChar, item.Product_Name)
              .input('Quantity', sql.Int, item.Quantity)
              .input('AddedBy', sql.VarChar, item.Added_by)
              .input('OrderSentStatus', sql.Bit, false)
              .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, Added_by, OrderSentStatus) VALUES (@NewOrderID, @OrderItemID, @Sku, @ProductName, @Quantity, @AddedBy, @OrderSentStatus)');
          orderItemId++;
      }

      await transaction.commit();
      res.json(newOrderId);
  } catch (err) {
      console.error('Failed to repeat order:', err);
      if (transaction) {
          await transaction.rollback();
      }
      res.status(500).json({ message: 'Failed to repeat order' });
  }
});







// app.get('/user/:id', async (req, res) => {
//   const userId = req.params.id;
//   try {
//     const pool = await sql.connect(config);
//     const result = await pool.request()
//       .input('userId', sql.Int, userId)
//       .query('SELECT ClientName, Email, Phone, Address, City, Country, Zip FROM Users WHERE UserId = @userId;');
    
//     if (result.recordset.length > 0) {
//       res.status(200).json(result.recordset[0]);
//     } else {
//       res.status(404).send('User not found');
//     }
//   } catch (err) {
//     console.error('Error fetching user:', err);
//     res.status(500).send('Error retrieving user data');
//   }
// });
// router.post('/api/save-excel', async (req, res) => {
//   try {
//       const excelData = req.body;
//       console.log('Received Excel Data:', excelData);

//       const qry = 'INSERT INTO Products (Product_Name, sku, description_, img, Brand) VALUES ?';

//       // Extract values from excelData and format them as an array of arrays
//       const values = excelData.map(row => [row.Product_Name, row.sku, row.description_, row.img, row.Brand]);

//       await pool.query(qry, [values]);

//       res.json({ message: 'Excel data saved successfully' });
//   } catch (error) {
//       console.error('Error saving Excel data:', error);
//       res.status(500).json({ message: 'Error saving Excel data' });
//   }
// });
app.use(bodyParser.json({ limit: '10mb' })); // Adjust the limit as needed

// Helper function to clean the row data
const cleanData = (data) => {
  if (typeof data === 'string') {
    return data.replace(/[\r\n]+/g, ' ').trim();
  }
  return data;
};

app.post('/api/save-excel', async (req, res) => {
  try {
    const excelData = req.body;
    console.log('Received Excel Data:', excelData);

    const pool = await sql.connect(config);
    const transaction = pool.transaction();
    await transaction.begin();

    const batchSize = 100; // Number of records to insert per batch
    for (let i = 0; i < excelData.length; i += batchSize) {
      const batch = excelData.slice(i, i + batchSize);
      const request = transaction.request();

      for (const row of batch) {
        await request
          .input('ProductName', sql.NVarChar, cleanData(row.Product_Name))
          .input('Sku', sql.NVarChar, cleanData(row.sku))
          .input('Description', sql.NVarChar, cleanData(row.description_))
          .input('Img', sql.NVarChar, cleanData(row.img || ''))
          .input('Brand', sql.NVarChar, cleanData(row.Brand))
          .input('Price', sql.Float, row.price || 0)
          .input('QuantityOnHand', sql.Float, row['\nquantity_on_hand'] || 0)
          .input('ItemType', sql.NVarChar, cleanData(row.ItemType))
          .query(`
            INSERT INTO Products (Product_Name, sku, description_, img, Brand, price, quantity_on_hand, ItemType)
            VALUES (@ProductName, @Sku, @Description, @Img, @Brand, @Price, @QuantityOnHand, @ItemType)
          `);
      }
    }

    await transaction.commit();
    res.json({ message: 'Excel data saved successfully' });
  } catch (error) {
    console.error('Error saving Excel data:', error);
    res.status(500).json({ message: 'Error saving Excel data', error: error.message });
  }
});

app.get('/user/:username', async (req, res) => {
  try {
      const { username } = req.params;
      const pool = await sql.connect(config);
      const request = pool.request();
      const result = await request
          .input('Username', sql.NVarChar, username)
          .query('SELECT ClientName, Email, Phone, Address, City, Country, Zip FROM Users WHERE ClientName = @Username');

      if (result.recordset.length === 0) {
          return res.status(404).json({ message: 'User not found' });
      }

      res.status(200).json(result.recordset[0]);
  } catch (err) {
      console.error('SQL error while fetching user details:', err);
      res.status(500).json({ message: 'Error fetching user details', error: err.message });
  }
});

// Endpoint to update user details
app.put('/user/:username', async (req, res) => {
  try {
      const { username } = req.params;
      const { email, phone, address, city, country, zip } = req.body;

      const pool = await sql.connect(config);
      const request = pool.request();

      // Update the user details in the database
      await request
          .input('Username', sql.NVarChar, username)
          .input('Email', sql.NVarChar, email)
          .input('Phone', sql.NVarChar, phone)
          .input('Address', sql.NVarChar, address)
          .input('City', sql.NVarChar, city)
          .input('Country', sql.NVarChar, country)
          .input('Zip', sql.NVarChar, zip)
          .query('UPDATE Users SET Email = @Email, Phone = @Phone, Address = @Address, City = @City, Country = @Country, Zip = @Zip WHERE ClientName = @Username');

      res.status(200).json({ message: 'User details updated successfully' });
  } catch (err) {
      console.error('SQL error while updating user details:', err);
      res.status(500).json({ message: 'Error updating user details', error: err.message });
  }
});



const writeProducts = (newProduct, callback) => {
  try {
      const qry = 'INSERT INTO Products (Product_Name, sku, description_, img, Brand) VALUES (?, ?, ?, ?, ?)';
      pool.query(qry, [newProduct.Product_Name, newProduct.sku, newProduct.description_, newProduct.img, newProduct.Brand], (err) => {
          callback(err);
      });
  } catch (error) {
      callback(error);
  }
};



router.post('/api/products', (req, res) => {
  try {
      const newProduct = req.body;
      writeProducts(newProduct, (err) => {
          if (err) {
              console.error('Error writing to products in the database:', err);
              res.status(500).json({ message: 'Error writing to products in the database' });
          } else {
              res.status(201).json({ message: 'Product added successfully.' });
          }
      });
  } catch (error) {
      console.error('Error processing product request:', error);
      res.status(500).json({ message: 'Error processing product request' });
  }
});

const readOrders = (username, callback) => {
  try {
      const qry = `SELECT * FROM Orders WHERE added_by='${username}'`;
      pool.query(qry, (err, result) => {
          if (err) {
              callback(err, null);
          } else {
              callback(null, result);
          }
      });
  } catch (error) {
      callback(error, null);
  }
};

app.get('/user/main/orders/:username', async (req, res) => {
  try {
    const username = req.params.username;
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('Username', sql.VarChar, username)
      .query('SELECT * FROM Orders WHERE added_by = @Username AND OrderSentStatus = 0');

    res.json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});



// app.post('/user/main/orders', async (req, res) => {
//   let transaction;
//   try {
//     const newOrder = req.body;
//     const pool = await sql.connect(config);

//     // Start a transaction
//     transaction = new sql.Transaction(pool);
//     await transaction.begin();

//     let orderID;
//     let orderItemID;

//     // Fetch the last order ID for the user where OrderSentStatus is false
//     const userOrderIDRequest = new sql.Request(transaction);
//     const result = await userOrderIDRequest
//       .input('AddedBy', sql.VarChar, newOrder.added_by)
//       .query('SELECT LastOrderID FROM UserOrderIDs WHERE Username = @AddedBy');

//     if (result.recordset.length > 0) {
//       // User exists, use the same order ID if OrderSentStatus is false
//       orderID = result.recordset[0].LastOrderID;

//       // Check if there are items in this order with OrderSentStatus false
//       const orderSentCheckRequest = new sql.Request(transaction);
//       const orderSentCheck = await orderSentCheckRequest
//         .input('OrderID', sql.Int, orderID)
//         .query('SELECT COUNT(*) AS Count FROM Orders WHERE OrderID = @OrderID AND OrderSentStatus = 0');

//       if (orderSentCheck.recordset[0].Count > 0) {
//         // There are items not sent yet, use the existing order ID
//         // Get the next OrderItemID for this order
//         const orderItemIDRequest = new sql.Request(transaction);
//         const orderItemIDResult = await orderItemIDRequest
//           .input('OrderID', sql.Int, orderID)
//           .query('SELECT ISNULL(MAX(OrderItemID), 0) + 1 AS NewOrderItemID FROM Orders WHERE OrderID = @OrderID');
//         orderItemID = orderItemIDResult.recordset[0].NewOrderItemID;

//         // Insert the new order item
//         const insertRequest = new sql.Request(transaction);
//         await insertRequest.input('OrderID', sql.Int, orderID)
//           .input('OrderItemID', sql.Int, orderItemID)
//           .input('Sku', sql.VarChar, newOrder.Sku)
//           .input('ProductName', sql.VarChar, newOrder.Product_Name)
//           .input('Quantity', sql.Int, newOrder.Quantity)
//           .input('AddedBy', sql.VarChar, newOrder.added_by)
//           .input('OrderSentStatus', sql.Bit, false)
//           .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, Added_by, OrderSentStatus) VALUES (@OrderID, @OrderItemID, @Sku, @ProductName, @Quantity, @AddedBy, @OrderSentStatus)');
//       } else {
//         // All items have been sent, create a new order ID
//         const newOrderIDRequest = new sql.Request(transaction);
//         const newOrderIDResult = await newOrderIDRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 AS NewOrderID FROM Orders');
//         orderID = newOrderIDResult.recordset[0].NewOrderID;

//         // Update the user's last order ID
//         const updateOrderIDRequest = new sql.Request(transaction);
//         await updateOrderIDRequest
//           .input('Username', sql.VarChar, newOrder.added_by)
//           .input('LastOrderID', sql.Int, orderID)
//           .query('UPDATE UserOrderIDs SET LastOrderID = @LastOrderID WHERE Username = @Username');

//         // Insert the new order item with OrderItemID starting from 1
//         const insertNewOrderRequest = new sql.Request(transaction);
//         await insertNewOrderRequest.input('OrderID', sql.Int, orderID)
//           .input('OrderItemID', sql.Int, 1)
//           .input('Sku', sql.VarChar, newOrder.Sku)
//           .input('ProductName', sql.VarChar, newOrder.Product_Name)
//           .input('Quantity', sql.Int, newOrder.Quantity)
//           .input('AddedBy', sql.VarChar, newOrder.added_by)
//           .input('OrderSentStatus', sql.Bit, false)
//           .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, Added_by, OrderSentStatus) VALUES (@OrderID, 1, @Sku, @ProductName, @Quantity, @AddedBy, @OrderSentStatus)');
//       }
//     } else {
//       // New user, create a new entry
//       const newOrderIDRequest = new sql.Request(transaction);
//       const newOrderIDResult = await newOrderIDRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 AS NewOrderID FROM Orders');
//       orderID = newOrderIDResult.recordset[0].NewOrderID;

//       // Insert new user order ID
//       const insertUserOrderIDRequest = new sql.Request(transaction);
//       await insertUserOrderIDRequest
//         .input('Username', sql.VarChar, newOrder.added_by)
//         .input('LastOrderID', sql.Int, orderID)
//         .query('INSERT INTO UserOrderIDs (Username, LastOrderID) VALUES (@Username, @LastOrderID)');

//       // Insert the new order item with OrderItemID starting from 1
//       const insertNewOrderRequest = new sql.Request(transaction);
//       await insertNewOrderRequest.input('OrderID', sql.Int, orderID)
//         .input('OrderItemID', sql.Int, 1)
//         .input('Sku', sql.VarChar, newOrder.Sku)
//         .input('ProductName', sql.VarChar, newOrder.Product_Name)
//         .input('Quantity', sql.Int, newOrder.Quantity)
//         .input('AddedBy', sql.VarChar, newOrder.added_by)
//         .input('OrderSentStatus', sql.Bit, false)
//         .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, Added_by, OrderSentStatus) VALUES (@OrderID, 1, @Sku, @ProductName, @Quantity, @AddedBy, @OrderSentStatus)');
//     }

//     await transaction.commit();
//     console.log('Order created successfully:', newOrder);
//     res.status(201).json({ message: 'Order created successfully.' });
//   } catch (err) {
//     console.error('SQL error while creating order:', err);
//     if (transaction) {
//       await transaction.rollback();
//     }
//     res.status(500).json({ message: 'Error creating order' });
//   }
// });

app.post('/user/main/orders', async (req, res) => {
  let transaction;
  try {
    const newOrder = req.body;
    const pool = await sql.connect(config);

    // Start a transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    let orderID;
    let orderItemID;

    // Fetch the last order ID for the user where OrderSentStatus is false
    const userOrderIDRequest = new sql.Request(transaction);
    const result = await userOrderIDRequest
      .input('AddedBy', sql.VarChar, newOrder.added_by)
      .query('SELECT LastOrderID FROM UserOrderIDs WHERE Username = @AddedBy');

    if (result.recordset.length > 0) {
      orderID = result.recordset[0].LastOrderID;
      const orderSentCheckRequest = new sql.Request(transaction);
      const orderSentCheck = await orderSentCheckRequest
        .input('OrderID', sql.Int, orderID)
        .query('SELECT COUNT(*) AS Count FROM Orders WHERE OrderID = @OrderID AND OrderSentStatus = 0');

      if (orderSentCheck.recordset[0].Count > 0) {
        const orderItemIDRequest = new sql.Request(transaction);
        const orderItemIDResult = await orderItemIDRequest
          .input('OrderID', sql.Int, orderID)
          .query('SELECT ISNULL(MAX(OrderItemID), 0) + 1 AS NewOrderItemID FROM Orders WHERE OrderID = @OrderID');
        orderItemID = orderItemIDResult.recordset[0].NewOrderItemID;

        const insertRequest = new sql.Request(transaction);
        await insertRequest.input('OrderID', sql.Int, orderID)
          .input('OrderItemID', sql.Int, orderItemID)
          .input('Sku', sql.VarChar, newOrder.Sku)
          .input('ProductName', sql.VarChar, newOrder.Product_Name)
          .input('Quantity', sql.Int, newOrder.Quantity)
          .input('UOM', sql.VarChar, newOrder.UOM)  // Include UOM in the SQL insert
          .input('AddedBy', sql.VarChar, newOrder.added_by)
          .input('OrderSentStatus', sql.Bit, false)
          .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, UOM, Added_by, OrderSentStatus) VALUES (@OrderID, @OrderItemID, @Sku, @ProductName, @Quantity, @UOM, @AddedBy, @OrderSentStatus)');
      } else {
        const newOrderIDRequest = new sql.Request(transaction);
        const newOrderIDResult = await newOrderIDRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 AS NewOrderID FROM Orders');
        orderID = newOrderIDResult.recordset[0].NewOrderID;

        const updateOrderIDRequest = new sql.Request(transaction);
        await updateOrderIDRequest
          .input('Username', sql.VarChar, newOrder.added_by)
          .input('LastOrderID', sql.Int, orderID)
          .query('UPDATE UserOrderIDs SET LastOrderID = @LastOrderID WHERE Username = @Username');

        const insertNewOrderRequest = new sql.Request(transaction);
        await insertNewOrderRequest.input('OrderID', sql.Int, orderID)
          .input('OrderItemID', sql.Int, 1)
          .input('Sku', sql.VarChar, newOrder.Sku)
          .input('ProductName', sql.VarChar, newOrder.Product_Name)
          .input('Quantity', sql.Int, newOrder.Quantity)
          .input('UOM', sql.VarChar, newOrder.UOM)  // Include UOM in the SQL insert
          .input('AddedBy', sql.VarChar, newOrder.added_by)
          .input('OrderSentStatus', sql.Bit, false)
          .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, UOM, Added_by, OrderSentStatus) VALUES (@OrderID, 1, @Sku, @ProductName, @Quantity, @UOM, @AddedBy, @OrderSentStatus)');
      }
    } else {
      const newOrderIDRequest = new sql.Request(transaction);
      const newOrderIDResult = await newOrderIDRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 AS NewOrderID FROM Orders');
      orderID = newOrderIDResult.recordset[0].NewOrderID;

      const insertUserOrderIDRequest = new sql.Request(transaction);
      await insertUserOrderIDRequest
        .input('Username', sql.VarChar, newOrder.added_by)
        .input('LastOrderID', sql.Int, orderID)
        .query('INSERT INTO UserOrderIDs (Username, LastOrderID) VALUES (@Username, @LastOrderID)');

      const insertNewOrderRequest = new sql.Request(transaction);
      await insertNewOrderRequest.input('OrderID', sql.Int, orderID)
        .input('OrderItemID', sql.Int, 1)
        .input('Sku', sql.VarChar, newOrder.Sku)
        .input('ProductName', sql.VarChar, newOrder.Product_Name)
        .input('Quantity', sql.Int, newOrder.Quantity)
        .input('UOM', sql.VarChar, newOrder.UOM)  // Include UOM in the SQL insert
        .input('AddedBy', sql.VarChar, newOrder.added_by)
        .input('OrderSentStatus', sql.Bit, false)
        .query('INSERT INTO Orders (OrderID, OrderItemID, Sku, Product_Name, Quantity, UOM, Added_by, OrderSentStatus) VALUES (@OrderID, 1, @Sku, @ProductName, @Quantity, @UOM, @AddedBy, @OrderSentStatus)');
    }

    await transaction.commit();
    console.log('Order created successfully:', newOrder);
    res.status(201).json({ message: 'Order created successfully.' });
  } catch (err) {
    console.error('SQL error while creating order:', err);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ message: 'Error creating order' });
  }
});








// app.put('/user/main/orders/send/:orderId', async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const pool = await sql.connect(config);
    
//     const qry = `UPDATE Orders 
//                  SET OrderSentStatus = @OrderSentStatus, OrderSentDate = GETDATE() 
//                  WHERE OrderID = @OrderId AND OrderSentStatus = 0`;
    
//     const request = pool.request();
//     request.input('OrderSentStatus', sql.Bit, true);
//     request.input('OrderId', sql.Int, orderId);
    
//     const result = await request.query(qry);

//     if (result.rowsAffected[0] > 0) {
//       console.log(`Order ${orderId} marked as sent.`);
//       res.status(200).json({ message: `Order ${orderId} marked as sent.` });
//     } else {
//       console.log(`Order ${orderId} not found or already sent.`);
//       res.status(404).json({ message: `Order ${orderId} not found or already sent.` });
//     }
//   } catch (err) {
//     console.error('SQL error while updating order:', err);
//     res.status(500).json({ message: 'Error updating order status' });
//   }
// });

app.put('/user/main/orders/send/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { comments } = req.body; // Extract comments from the request body
    const pool = await sql.connect(config);

    const qry = `UPDATE Orders 
                 SET OrderSentStatus = @OrderSentStatus, 
                     OrderSentDate = GETDATE(), 
                     Comments = @Comments 
                 WHERE OrderID = @OrderId AND OrderSentStatus = 0`;
    
    const request = pool.request();
    request.input('OrderSentStatus', sql.Bit, true);
    request.input('OrderId', sql.Int, orderId);
    request.input('Comments', sql.NVarChar, comments || ''); // Add the comments to the request inputs
    
    const result = await request.query(qry);

    if (result.rowsAffected[0] > 0) {
      console.log(`Order ${orderId} marked as sent.`);
      res.status(200).json({ message: `Order ${orderId} marked as sent.` });
    } else {
      console.log(`Order ${orderId} not found or already sent.`);
      res.status(404).json({ message: `Order ${orderId} not found or already sent.` });
    }
  } catch (err) {
    console.error('SQL error while updating order:', err);
    res.status(500).json({ message: 'Error updating order status' });
  }
});





// Add this route to your existing router

app.delete('/api/delete-order-product/:sku', async (req, res) => {
  try {
      const sku = req.params.sku;
      const qry = 'DELETE FROM Orders WHERE Sku = @sku';

      const pool = await sql.connect(config);
      const request = pool.request();
      request.input('sku', sql.NVarChar, sku);

      const result = await request.query(qry);

      if (result.rowsAffected[0] > 0) {
          res.status(200).json({ message: 'Product deleted successfully.' });
      } else {
          res.status(404).json({ message: 'Product not found.' });
      }
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
  }
});


app.delete('/api/delete-product/:product_id', async (req, res) => {
  try {
      const product_id = req.params.product_id;
      const qry = 'DELETE from products WHERE product_id = ?'; 
      console.log(product_id);
      const result = await pool.query(qry, [product_id]);

      if (result.affectedRows > 0) {
          res.status(200).json({ message: 'Product deleted successfully.' });
      } else {
          res.status(404).json({ message: 'Product not found.' });
      }
  } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Error deleting product' });
  }
});

app.put('/api/edit-quantity/:sku', async (req, res) => {
  try {
      // Retrieve SKU from the request parameters
      const sku = req.params.sku;

      // Retrieve the new quantity from the request body
      const { newQuantity } = req.body;

      // Establish a database connection
      const pool = await sql.connect(config);
      const qry = `UPDATE Orders 
                   SET Quantity = @newQuantity 
                   WHERE Sku = @sku`;

      // Create a request object
      const request = pool.request();
      request.input('newQuantity', sql.Int, newQuantity);
      request.input('sku', sql.NVarChar, sku);

      // Execute the query
      const result = await request.query(qry);

      // Check if any rows were affected
      if (result.rowsAffected[0] > 0) {
          res.json({ message: 'Quantity updated successfully' });
      } else {
          res.status(404).json({ message: 'Order not found' });
      }
  } catch (error) {
      console.error('Error editing quantity:', error);
      res.status(500).json({ message: 'Error editing quantity' });
  }
});



const loginUser = (username, password, callback) => {
  try {
      const qry = 'SELECT roletype FROM logins WHERE username = ? AND password = ?';
      pool.query(qry, [username, password], (err, result) => {
          if (err) {
              callback(err, null);
          } else {
              callback(null, result);
          }
      });
  } catch (error) {
      callback(error, null);
  }
};

router.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  try {
      loginUser(username, password, (err, result) => {
          if (err) {
              res.status(500).json({ error: 'Internal Server Error' });
          } else {
              if (result && result.length > 0) {
                  const role = result[0].roletype;
                  console.log(role);
                  res.json({ role });
              } else {
                  res.status(401).json({ error: 'Invalid login credentials' });
              }
          }
      });
  } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


const readProductById = (productId, callback) => {
  try {
      const qry = 'SELECT * FROM Products WHERE product_id = ?';
      pool.query(qry, [productId], (err, result) => {
          if (err) {
              callback(err, null);
          } else {
              callback(null, result[0]); // Assuming product_id is unique, so we return the first (and only) result
          }
      });
  } catch (error) {
      callback(error, null);
  }
};

app.get('/edit/:productId', async (req, res) => {
  const { productId } = req.params;

  try {
    const pool = await sql.connect(config);
    const qry = `SELECT product_id, Product_Name, sku, description_, img, Brand 
                 FROM dbo.Products 
                 WHERE product_id = @ProductId`;

    const request = pool.request();
    request.input('ProductId', sql.Int, productId);

    const result = await request.query(qry);

    if (result.recordset.length > 0) {
      const product = result.recordset[0];
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.error('SQL error while reading product details:', err);
    res.status(500).json({ message: 'Error reading product from the database' });
  }
});



app.put('/edit/:productId', upload.single('img'), async (req, res) => {
  const { productId } = req.params;
  const { Product_Name, sku, Brand } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  try {
    const pool = await sql.connect(config);
    const qry = `UPDATE Products 
                 SET Product_Name = @Product_Name, 
                     sku = @sku, 
                     Brand = @Brand,
                     img = @Img
                 WHERE product_id = @ProductId`;

    const request = pool.request();
    request.input('Product_Name', sql.NVarChar, Product_Name);
    request.input('sku', sql.NVarChar, sku);
    request.input('Brand', sql.NVarChar, Brand);
    request.input('Img', sql.NVarChar, imageUrl);
    request.input('ProductId', sql.Int, productId);

    const result = await request.query(qry);

    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Product updated successfully.', imageUrl: imageUrl });
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ message: 'Error updating product details' });
  }
});

app.get('/new-arrivals', async (req, res) => {
  try {
    const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM dbo.NewArrivals');
      res.json(result.recordset);
  } catch (err) {
      console.error('SQL error while fetching new arrivals:', err);
      res.status(500).json({ message: 'Error fetching new arrivals from the database' });
  }
});

app.get('/special-deals', async (req, res) => {
  try {
      const pool = await sql.connect(config);
      const result = await pool.request().query('SELECT * FROM SpecialDeals');
      res.json(result.recordset);
  } catch (err) {
      console.error('SQL error while fetching special deals:', err);
      res.status(500).json({ message: 'Error fetching special deals' });
  }
});



// router.get('/api/products/:productId', (req, res) => {
//   try {
//       const productId = req.params.productId;

//       readProductById(productId, (err, product) => {
//           if (err) {
//               res.status(500).json({ message: 'Error reading product from the database' });
//           } else {
//               if (!product) {
//                   res.status(404).json({ error: 'Product not found' });
//               } else {
//                   res.json(product);
//               }
//           }
//       });
//   } catch (error) {
//       res.status(500).json({ message: 'Error reading product from the database' });
//   }
// });


// // Route to update a product by ID
// router.put('/api/products/:productId', async (req, res) => {
//   try {
//     const productId = req.params.productId;
//     const updatedProduct = req.body;

//     const product = await Product.findByIdAndUpdate(productId, updatedProduct, {
//       new: true, // Return the updated document
//       runValidators: true, // Run model validation on update
//     });

//     if (!product) {
//       return res.status(404).json({ error: 'Product not found' });
//     }

//     res.json(product);
//   } catch (error) {
//     console.error('Error updating product details:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// });



//employee

// Fetch all orders
app.get('/employee/orders', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query(`
      SELECT DISTINCT OrderID, Added_by
      FROM dbo.Orders
      WHERE OrderSentStatus = 1 AND (OrderStatus != 'fulfilled' OR OrderStatus IS NULL)
    `);
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});// Fetch order details by order ID
  app.get('/employee/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      const pool = await sql.connect(config);
      const result = await pool.request()
      .input('OrderID', sql.Int, orderId)
      .query('SELECT * FROM Orders WHERE OrderID = @OrderID AND OrderSentStatus = 1 AND (OrderStatus != \'fulfilled\' OR OrderStatus IS NULL)');
    
      res.status(200).json(result.recordset);
    } catch (err) {
      console.error('SQL error while fetching order details:', err);
      res.status(500).json({ message: 'Error fetching order details' });
    }
  });


app.put('/employee/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, fulfilledBy } = req.body;
    const pool = await sql.connect(config);

    const query = `
      UPDATE dbo.Orders
      SET 
        FulfilledBy = @FulfilledBy,
        FulfilledDate = CASE WHEN @OrderStatus = 'fulfilled' THEN GETDATE() ELSE NULL END,
        OrderStatus = @OrderStatus
      WHERE OrderID = @OrderID;
    `;
    const request = pool.request()
      .input('OrderStatus', sql.VarChar, status)
      .input('FulfilledBy', sql.NVarChar, fulfilledBy)
      .input('OrderID', sql.Int, orderId);

    const result = await request.query(query);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: `Order ${orderId} updated to ${status}.` });
    } else {
      res.status(404).json({ message: `Order ${orderId} not found.` });
    }
  } catch (err) {
    console.error('SQL error while updating order status:', err);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

app.get('/qfctable', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM QFCProducts');
   
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching QFC products:', err);
    res.status(500).json({ message: 'Error fetching QFC products' });
  }
});

// app.get('/orderinstantly/products', async (req, res) => {
//   try {
//     const pool = await sql.connect(config);
//     const result = await pool.request()
//       .query('SELECT * FROM QFCProducts');
   
//     res.status(200).json(result.recordset);
//   } catch (err) {
//     console.error('SQL error while fetching QFC products:', err);
//     res.status(500).json({ message: 'Error fetching QFC products' });
//   }
// });
app.get('/products711', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .query('SELECT * FROM products711');

    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching products from products711:', err);
    res.status(500).json({ message: 'Error fetching products from products711' });
  }
});




// Endpoint to place an order for general users
app.post('/generaluser/orders', async (req, res) => {
  let transaction;
  try {
    console.log('req.body:', req.body);   // Debugging log

    const { Product_Name, Sku, Quantity, UOM, added_by } = req.body;

    const pool = await sql.connect(config);

    // Start a transaction
    transaction = new sql.Transaction(pool);
    await transaction.begin();

    let orderID;
    const newOrderIDRequest = new sql.Request(transaction);
    const newOrderIDResult = await newOrderIDRequest.query('SELECT ISNULL(MAX(OrderID), 0) + 1 AS NewOrderID FROM generalorders');
    orderID = newOrderIDResult.recordset[0].NewOrderID;

    // Insert the order into the generalorders table
    const insertRequest = new sql.Request(transaction);
    await insertRequest.input('OrderID', sql.Int, orderID)
      .input('OrderItemID', sql.Int, 1) // Assuming a single item order for simplicity
      .input('Sku', sql.NVarChar, Sku)
      .input('ProductName', sql.NVarChar, Product_Name)
      .input('Quantity', sql.Int, Quantity)
      .input('UOM', sql.NVarChar, UOM)
      .input('AddedBy', sql.NVarChar, added_by)
      .input('OrderSentStatus', sql.Bit, false)
      .input('OrderSentDate', sql.DateTime, new Date())
      .input('OrderStatus', sql.NVarChar, 'Pending')
      .input('FulfilledDate', sql.DateTime, null)
      .input('FulfilledBy', sql.NVarChar, null)
      .query(`
        INSERT INTO dbo.generalorders (
          OrderID, OrderItemID, Sku, Product_Name, Quantity, UOM, Added_by, 
          OrderSentStatus, OrderSentDate, OrderStatus, FulfilledDate, FulfilledBy
        ) VALUES (
          @OrderID, @OrderItemID, @Sku, @ProductName, @Quantity, @UOM, @AddedBy, 
          @OrderSentStatus, @OrderSentDate, @OrderStatus, @FulfilledDate, @FulfilledBy
        )
      `);

    await transaction.commit();
    console.log('Order created successfully for general user:', req.body);
    res.status(201).json({ message: 'Order created successfully.' });
  } catch (err) {
    console.error('SQL error while creating order:', err);
    if (transaction) {
      await transaction.rollback();
    }
    res.status(500).json({ message: 'Error creating order' });
  }
});
// Endpoint to send the general user order
app.put('/generaluser/orders/send/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const { comments } = req.body; // Extract comments from the request body
    const pool = await sql.connect(config);

    const qry = `UPDATE generalorders 
                 SET OrderSentStatus = @OrderSentStatus, 
                     OrderSentDate = GETDATE(), 
                     Comments = @Comments 
                 WHERE OrderID = @OrderId AND OrderSentStatus = 0`;
    
    const request = pool.request();
    request.input('OrderSentStatus', sql.Bit, true);
    request.input('OrderId', sql.Int, orderId);
    request.input('Comments', sql.NVarChar, comments || ''); // Add the comments to the request inputs
    
    const result = await request.query(qry);

    if (result.rowsAffected[0] > 0) {
      console.log(`Order ${orderId} marked as sent.`);
      res.status(200).json({ message: `Order ${orderId} marked as sent.` });
    } else {
      console.log(`Order ${orderId} not found or already sent.`);
      res.status(404).json({ message: `Order ${orderId} not found or already sent.` });
    }
  } catch (err) {
    console.error('SQL error while updating order:', err);
    res.status(500).json({ message: 'Error updating order status' });
  }
});

// Endpoint to delete a product from the general user orders
app.delete('/generaluser/delete-order-product/:sku', async (req, res) => {
  try {
    const { sku } = req.params;
    const qry = 'DELETE FROM generalorders WHERE Sku = @sku';

    const pool = await sql.connect(config);
    const request = pool.request();
    request.input('sku', sql.NVarChar, sku);

    const result = await request.query(qry);

    if (result.rowsAffected[0] > 0) {
      res.status(200).json({ message: 'Product deleted successfully.' });
    } else {
      res.status(404).json({ message: 'Product not found.' });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// Endpoint to edit the quantity for a general user order
app.put('/generaluser/edit-quantity/:sku', async (req, res) => {
  try {
    // Retrieve SKU from the request parameters
    const { sku } = req.params;

    // Retrieve the new quantity from the request body
    const { newQuantity } = req.body;

    // Establish a database connection
    const pool = await sql.connect(config);
    const qry = `UPDATE generalorders 
                 SET Quantity = @newQuantity 
                 WHERE Sku = @sku`;

    // Create a request object
    const request = pool.request();
    request.input('newQuantity', sql.Int, newQuantity);
    request.input('sku', sql.NVarChar, sku);

    // Execute the query
    const result = await request.query(qry);

    // Check if any rows were affected
    if (result.rowsAffected[0] > 0) {
      res.json({ message: 'Quantity updated successfully' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    console.error('Error editing quantity:', error);
    res.status(500).json({ message: 'Error editing quantity' });
  }
});
app.get('/generaluser/orders', async (req, res) => {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM generalorders');
    res.status(200).json(result.recordset);
  } catch (err) {
    console.error('SQL error while fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../my-frontend/build', 'index.html'));
});
