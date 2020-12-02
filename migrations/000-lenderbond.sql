--Up
CREATE TABLE accountHolder (
	PRIMARY KEY(user_id),
    user_id	INTEGER,
	username	TEXT NOT NULL,
	pass	TEXT NOT NULL,
	first_name	TEXT,
	last_name	TEXT,
	email	TEXT,
	address	TEXT,
	timezone	TEXT,
	Avatar	TEXT,
	token	TEXT NOT NULL);

CREATE TABLE DirectMessages(
	DM_ID	INTEGER PRIMARY KEY NOT NULL,
	Head_User	INTEGER NOT NULL,
	MessageTimestamp	DATETIME NOT NULL,
	Message	TEXT NOT NULL,
	Other_User	INTEGER NOT NULL,
	FOREIGN KEY(Other_User) REFERENCES accountHolder(user_id),
	FOREIGN KEY(Head_User) REFERENCES accountHolder(user_id));

CREATE TABLE businessAccount(businessAccount_id INTEGER PRIMARY KEY,
                          user_id INTEGER NOT NULL,
                          business_name TEXT NOT NULL,
                          FOREIGN KEY (user_id) REFERENCES accountHolder(user_id));



CREATE TABLE messageBoard (
	MBthred_id	INTEGER PRIMARY KEY,
	subjectTitle	TEXT NOT NULL,
	dateCreated	DATETIME NOT NULL,
	threadTopic	TEXT);

CREATE TABLE MBmessages(MessageNumber INTEGER PRIMARY KEY,
                          MBthred_id INTEGER NOT NULL,
user_id INTEGER NOT NULL,
message TEXT NOT NULL, 
MessageTimestamp DATETIME NOT NULL,
FOREIGN KEY (MBthred_id) REFERENCES messageBoard(MBthred_id),
FOREIGN KEY(user_id) REFERENCES accountHolder(user_id));

CREATE TABLE Bond(bond_id INTEGER PRIMARY KEY,
currency TEXT NOT NULL, 
bond_amount REAL NOT NULL, 
bond_name TEXT NOT NULL, 
MBthred_id INTEGER NOT NULL, 
FOREIGN KEY (MBthred_id) REFERENCES messageBoard(MBthred_id));

CREATE TABLE bondsHeld(accountNumber INTEGER PRIMARY KEY, 
user_id INTEGER NOT NULL, 
bond_id INTEGER NOT NULL,
FOREIGN KEY (user_id) REFERENCES accountHolder(user_id),
FOREIGN KEY (bond_id) REFERENCES Bond(bond_id));

CREATE TABLE Loan (
	loan_id	INTEGER PRIMARY KEY,
	init_currency	TEXT NOT NULL,
	interest_rate	FLOAT NOT NULL,
	loan_amount	REAL NOT NULL,
	loan_name	TEXT NOT NULL,
	MBthred_id	INTEGER NOT NULL,
	loan_type	TEXT,
	loan_term	FLOAT,
	FOREIGN KEY(MBthred_id) REFERENCES messageBoard(MBthred_id));
    
CREATE TABLE loansHeld(accountNumber INTEGER PRIMARY KEY, user_id INTEGER NOT NULL, 
			  loan_id INTEGER NOT NULL,
                          FOREIGN KEY (user_id) REFERENCES accountHolder(user_id),
                          FOREIGN KEY (loan_id) REFERENCES Loan(loan_id));

CREATE TABLE standardAccount(standardAccount_id INTEGER PRIMARY KEY,
user_id INTEGER NOT NULL,
FOREIGN KEY (user_id) REFERENCES accountHolder(user_id));

--Down
DROP TABLE messageBoard;
DROP TABLE Bond;
DROP TABLE accountHolder;
DROP TABLE DirectMessages;
DROP TABLE Loan;
DROP TABLE MBmessages;
DROP TABLE bondsHeld;
DROP TABLE businessAccount;
DROP TABLE loansHeld;
DROP TABLE standardAccount;