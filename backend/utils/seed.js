const dotenv = require('dotenv');
const connectDB = require('../config/db');
const User = require('../models/User');
const Account = require('../models/Account');
const Transaction = require('../models/Transaction');
const Transfer = require('../models/Transfer');
const Card = require('../models/Card');
const Cheque = require('../models/Cheque');
const FixedDeposit = require('../models/FixedDeposit');
const CashDeposit = require('../models/CashDeposit');
const Bill = require('../models/Bill');
const Budget = require('../models/Budget');
const Expense = require('../models/Expense');
const SavingsGoal = require('../models/SavingsGoal');
const Investment = require('../models/Investment');
const Loan = require('../models/Loan');
const Notification = require('../models/Notification');
const SupportTicket = require('../models/SupportTicket');
const Message = require('../models/Message');
const AdminLog = require('../models/AdminLog');
const LoginActivity = require('../models/LoginActivity');

dotenv.config();

const usersSeedList = [
  { userId: 'USR1001', fullName: 'Dipsun Patel', email: 'demo@finova.com', phone: '+1 (555) 019-2834', dob: '1996-08-24', gender: 'Male', occupation: 'Senior Software Architect', nationalId: 'SSN-982-10-4829', address: '742 Evergreen Terrace', city: 'San Francisco', state: 'CA', country: 'United States', zip: '94102', chkBal: 34520.75, savBal: 50000.00 },
  { userId: 'USR1002', fullName: 'Alex Morgan', email: 'alex.morgan@finova.com', phone: '+1 (555) 123-4567', dob: '1992-04-12', gender: 'Female', occupation: 'Financial Analyst', nationalId: 'SSN-481-92-0192', address: '120 Market Street', city: 'New York', state: 'NY', country: 'United States', zip: '10001', chkBal: 18400.00, savBal: 32000.00 },
  { userId: 'USR1003', fullName: 'Sarah Jenkins', email: 'sarah.jenkins@finova.com', phone: '+1 (555) 234-5678', dob: '1989-11-05', gender: 'Female', occupation: 'Creative Director', nationalId: 'SSN-192-83-7462', address: '45 Michigan Ave', city: 'Chicago', state: 'IL', country: 'United States', zip: '60601', chkBal: 24150.00, savBal: 45000.00 },
  { userId: 'USR1004', fullName: 'Rahul Sharma', email: 'rahul.sharma@finova.com', phone: '+91 98765 43210', dob: '1994-01-18', gender: 'Male', occupation: 'Product Manager', nationalId: 'PAN-ABCDE1234F', address: '22 Bandra West', city: 'Mumbai', state: 'MH', country: 'India', zip: '400050', chkBal: 42800.00, savBal: 65000.00 },
  { userId: 'USR1005', fullName: 'Emily Watson', email: 'emily.watson@finova.com', phone: '+1 (555) 345-6789', dob: '1998-07-22', gender: 'Female', occupation: 'Data Scientist', nationalId: 'SSN-928-37-4610', address: '88 Boylston St', city: 'Boston', state: 'MA', country: 'United States', zip: '02116', chkBal: 12900.00, savBal: 28000.00 },
  { userId: 'USR1006', fullName: 'Marcus Vance', email: 'marcus.vance@finova.com', phone: '+1 (555) 456-7890', dob: '1985-09-30', gender: 'Male', occupation: 'Investment Banker', nationalId: 'SSN-837-46-1928', address: '500 Wall St', city: 'New York', state: 'NY', country: 'United States', zip: '10005', chkBal: 65000.00, savBal: 120000.00 },
  { userId: 'USR1007', fullName: 'Priya Verma', email: 'priya.verma@finova.com', phone: '+91 98123 45678', dob: '1997-03-14', gender: 'Female', occupation: 'UI/UX Designer', nationalId: 'AADHAR-9821-4820-1920', address: '10 MG Road', city: 'Bengaluru', state: 'KA', country: 'India', zip: '560001', chkBal: 31200.00, savBal: 40000.00 },
  { userId: 'USR1008', fullName: 'David Chen', email: 'david.chen@finova.com', phone: '+1 (555) 567-8901', dob: '1990-12-08', gender: 'Male', occupation: 'Cloud Architect', nationalId: 'SSN-746-19-2837', address: '300 Pine St', city: 'Seattle', state: 'WA', country: 'United States', zip: '98101', chkBal: 54000.00, savBal: 85000.00 },
  { userId: 'USR1009', fullName: 'Elizabeth Taylor', email: 'elizabeth.taylor@finova.com', phone: '+1 (555) 678-9012', dob: '1993-06-25', gender: 'Female', occupation: 'Marketing Lead', nationalId: 'SSN-635-24-1928', address: '75 Ocean Drive', city: 'Miami', state: 'FL', country: 'United States', zip: '33139', chkBal: 22600.00, savBal: 38000.00 },
  { userId: 'USR1010', fullName: 'Carlos Rodriguez', email: 'carlos.rodriguez@finova.com', phone: '+1 (555) 789-0123', dob: '1991-08-17', gender: 'Male', occupation: 'Civil Engineer', nationalId: 'SSN-524-13-0987', address: '410 Sunset Blvd', city: 'Los Angeles', state: 'CA', country: 'United States', zip: '90028', chkBal: 19850.00, savBal: 30000.00 },
  { userId: 'USR1011', fullName: 'Ananya Roy', email: 'ananya.roy@finova.com', phone: '+91 97111 22233', dob: '1995-10-03', gender: 'Female', occupation: 'Chartered Accountant', nationalId: 'PAN-XYZPR9876Q', address: '14 Park Street', city: 'Kolkata', state: 'WB', country: 'India', zip: '700016', chkBal: 38700.00, savBal: 55000.00 },
  { userId: 'USR1012', fullName: 'James Wilson', email: 'james.wilson@finova.com', phone: '+1 (555) 890-1234', dob: '1987-02-28', gender: 'Male', occupation: 'Legal Counsel', nationalId: 'SSN-413-02-9876', address: '90 Constitution Ave', city: 'Washington', state: 'DC', country: 'United States', zip: '20001', chkBal: 29400.00, savBal: 48000.00 },
  { userId: 'USR1013', fullName: 'Sophia Martinez', email: 'sophia.martinez@finova.com', phone: '+1 (555) 901-2345', dob: '1996-05-19', gender: 'Female', occupation: 'Biotech Researcher', nationalId: 'SSN-302-91-8765', address: '50 Tech Square', city: 'Cambridge', state: 'MA', country: 'United States', zip: '02139', chkBal: 47300.00, savBal: 70000.00 },
  { userId: 'USR1014', fullName: 'Vikram Singh', email: 'vikram.singh@finova.com', phone: '+91 99887 66554', dob: '1988-12-12', gender: 'Male', occupation: 'Operations Director', nationalId: 'AADHAR-1234-5678-9012', address: '88 Connaught Place', city: 'New Delhi', state: 'DL', country: 'India', zip: '110001', chkBal: 51000.00, savBal: 90000.00 },
  { userId: 'USR1015', fullName: 'Hannah Brown', email: 'hannah.brown@finova.com', phone: '+1 (555) 012-3456', dob: '1999-09-09', gender: 'Female', occupation: 'HR Business Partner', nationalId: 'SSN-291-80-7654', address: '12 Peachtree St', city: 'Atlanta', state: 'GA', country: 'United States', zip: '30303', chkBal: 16500.00, savBal: 25000.00 },
  { userId: 'USR1016', fullName: 'Liam O\'Connor', email: 'liam.oconnor@finova.com', phone: '+1 (555) 123-9876', dob: '1992-01-31', gender: 'Male', occupation: 'DevOps Engineer', nationalId: 'SSN-180-79-6543', address: '40 Austin Blvd', city: 'Austin', state: 'TX', country: 'United States', zip: '78701', chkBal: 33100.00, savBal: 49000.00 },
  { userId: 'USR1017', fullName: 'Olivia Garcia', email: 'olivia.garcia@finova.com', phone: '+1 (555) 234-8765', dob: '1994-07-11', gender: 'Female', occupation: 'Architect', nationalId: 'SSN-079-68-5432', address: '200 Broadway', city: 'Denver', state: 'CO', country: 'United States', zip: '80202', chkBal: 27900.00, savBal: 41000.00 },
  { userId: 'USR1018', fullName: 'Arjun Kapoor', email: 'arjun.kapoor@finova.com', phone: '+91 96543 21098', dob: '1991-03-27', gender: 'Male', occupation: 'E-commerce Lead', nationalId: 'PAN-JKLM9876P', address: '5 Sector 17', city: 'Chandigarh', state: 'PB', country: 'India', zip: '160017', chkBal: 44200.00, savBal: 62000.00 },
  { userId: 'USR1019', fullName: 'Chloe Dubois', email: 'chloe.dubois@finova.com', phone: '+1 (555) 345-7654', dob: '1997-11-15', gender: 'Female', occupation: 'PR Strategist', nationalId: 'SSN-968-57-4321', address: '15 Champs Ave', city: 'Dallas', state: 'TX', country: 'United States', zip: '75201', chkBal: 21800.00, savBal: 36000.00 },
  { userId: 'USR1020', fullName: 'Mohammed Al-Mansoor', email: 'mohammed.almansoor@finova.com', phone: '+1 (555) 456-6543', dob: '1986-04-04', gender: 'Male', occupation: 'Venture Capitalist', nationalId: 'SSN-857-46-3210', address: '1 FinTech Plaza', city: 'San Jose', state: 'CA', country: 'United States', zip: '95113', chkBal: 88500.00, savBal: 180000.00 }
];

const runSeeder = async () => {
  console.log('Seeding Finova 20-User Banking Database...');

  // Clear existing collections
  await User.deleteMany({});
  await Account.deleteMany({});
  await Transaction.deleteMany({});
  await Transfer.deleteMany({});
  await Card.deleteMany({});
  await Cheque.deleteMany({});
  await FixedDeposit.deleteMany({});
  await CashDeposit.deleteMany({});
  await Bill.deleteMany({});
  await Budget.deleteMany({});
  await Expense.deleteMany({});
  await SavingsGoal.deleteMany({});
  await Investment.deleteMany({});
  await Loan.deleteMany({});
  await Notification.deleteMany({});
  await SupportTicket.deleteMany({});
  await Message.deleteMany({});
  await AdminLog.deleteMany({});
  await LoginActivity.deleteMany({});

  // 1. Create Fixed Admin User
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin';

  const adminUser = await User.create({
    userId: 'ADMIN',
    fullName: 'Finova Administrator',
    email: adminEmail,
    password: adminPassword,
    phone: '+1 (800) 555-FINOVA',
    dateOfBirth: '1985-01-01',
    role: 'admin',
    status: 'Active',
    kycStatus: 'Verified',
    profileImage: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop&q=80'
  });
  console.log(`Admin user created: ${adminEmail} (Password: ${adminPassword})`);

  // 2. Create 20 Complete Users with Bank Accounts, Cards, FDs, Cheques, Slips
  for (const u of usersSeedList) {
    const createdUser = await User.create({
      userId: u.userId,
      fullName: u.fullName,
      email: u.email,
      password: 'password123',
      phone: u.phone,
      dateOfBirth: u.dob,
      gender: u.gender,
      occupation: u.occupation,
      nationalId: u.nationalId,
      address: u.address,
      city: u.city,
      state: u.state,
      country: u.country,
      zipCode: u.zip,
      emergencyContact: '+1 (555) 999-0000',
      nomineeName: u.fullName.split(' ')[0] + ' Senior',
      nomineeRelation: 'Parent',
      nomineeAge: 55,
      role: 'user',
      status: 'Active',
      kycStatus: 'Verified',
      creditScore: 750 + Math.floor(Math.random() * 80),
      profileImage: `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.userId}`
    });

    // Create Checking & Savings Accounts
    const chkAcc = await Account.create({
      user: createdUser._id,
      accountNumber: 'FN-CHK-' + Math.floor(100000000 + Math.random() * 900000000),
      accountType: 'Checking Account',
      balance: u.chkBal,
      availableBalance: u.chkBal
    });

    const savAcc = await Account.create({
      user: createdUser._id,
      accountNumber: 'FN-SAV-' + Math.floor(100000000 + Math.random() * 900000000),
      accountType: 'Savings Account',
      balance: u.savBal,
      availableBalance: u.savBal
    });

    // Create Virtual Debit Card with 4-digit ATM PIN
    const cardPin = (1000 + Math.floor(Math.random() * 8999)).toString();
    await Card.create({
      user: createdUser._id,
      account: chkAcc._id,
      cardNumber: '4821 ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000) + ' ' + Math.floor(1000 + Math.random() * 9000),
      cardHolderName: u.fullName.toUpperCase(),
      validThru: '12/29',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      pin: cardPin,
      cardType: 'Debit',
      brand: 'Visa',
      spendingLimit: 10000,
      cardColor: 'from-blue-600 via-indigo-600 to-purple-800'
    });

    // Create sample Fixed Deposit
    const fdPrincipal = 5000 + Math.floor(Math.random() * 15000);
    const fdInterest = 7.5;
    const fdMaturity = fdPrincipal * 1.075;
    const maturityDate = new Date();
    maturityDate.setFullYear(maturityDate.getFullYear() + 1);

    await FixedDeposit.create({
      user: createdUser._id,
      account: savAcc._id,
      fdNumber: 'FD-' + Math.floor(10000000 + Math.random() * 90000000),
      principalAmount: fdPrincipal,
      tenureMonths: 12,
      interestRate: fdInterest,
      payoutFrequency: 'On Maturity',
      maturityAmount: parseFloat(fdMaturity.toFixed(2)),
      maturityDate,
      startDate: new Date(Date.now() - 30 * 86400000),
      nomineeName: createdUser.nomineeName,
      nomineeRelation: 'Parent',
      nomineeAge: 55,
      status: 'Active'
    });

    // Create sample Cheque Deposit / Withdrawal
    await Cheque.create({
      user: createdUser._id,
      account: chkAcc._id,
      chequeType: 'Deposit',
      chequeNumber: (500000 + Math.floor(Math.random() * 400000)).toString(),
      bankName: 'National Trust Bank',
      payeeName: u.fullName,
      drawerName: 'Global Enterprise Corp',
      accountNumber: chkAcc.accountNumber,
      amount: 2500.00,
      status: 'Cleared',
      referenceNumber: 'CHQ-' + Math.floor(10000000 + Math.random() * 90000000)
    });

    // Create sample Cash Deposit Slip
    await CashDeposit.create({
      user: createdUser._id,
      account: chkAcc._id,
      slipNumber: 'SLIP-' + Math.floor(10000000 + Math.random() * 90000000),
      depositorName: u.fullName,
      depositorPhone: u.phone,
      denominations: { d2000: 2, d500: 2, d100: 10 },
      totalAmount: 6000,
      branchCode: 'FN-MAIN-001',
      remark: 'Initial Cash Deposit in Account',
      status: 'Completed'
    });

    // Create sample Transactions
    await Transaction.create([
      {
        user: createdUser._id,
        account: chkAcc._id,
        type: 'Salary',
        amount: 8500.00,
        currency: 'USD',
        status: 'Completed',
        description: 'Monthly Direct Salary Deposit',
        category: 'Salary',
        referenceNumber: 'FN-SAL-' + Math.floor(100000 + Math.random() * 900000),
        recipientName: u.fullName
      },
      {
        user: createdUser._id,
        account: chkAcc._id,
        type: 'Payment',
        amount: 124.50,
        currency: 'USD',
        status: 'Completed',
        description: 'Supermarket Grocery Purchase',
        category: 'Food',
        referenceNumber: 'FN-POS-' + Math.floor(100000 + Math.random() * 900000),
        recipientName: 'Whole Foods Market'
      }
    ]);

    // Sample Notification
    await Notification.create({
      user: createdUser._id,
      title: 'Welcome to Finova Digital Banking',
      message: `Your account with User ID '${u.userId}' has been initialized by Bank Administrator.`,
      type: 'system'
    });
  }

  // Admin Log
  await AdminLog.create({
    actor: adminUser._id,
    actorName: adminUser.fullName,
    action: '20 User Accounts Seeded',
    target: 'Database',
    ip: '127.0.0.1',
    description: 'Seeded 20 active user banking accounts with cards, fixed deposits, cheques, and cash deposit slips.'
  });

  console.log('Successfully seeded 20 full user accounts!');
};

// Executable if run directly via `node utils/seed.js`
if (require.main === module) {
  connectDB()
    .then(async () => {
      await runSeeder();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}

module.exports = { runSeeder };
