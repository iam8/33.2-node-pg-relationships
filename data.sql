
DROP TABLE IF EXISTS companies_industries;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS companies;
DROP TABLE IF EXISTS industries;

CREATE TABLE companies (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE invoices (
    id serial PRIMARY KEY,
    comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
    amt float NOT NULL,
    paid boolean DEFAULT false NOT NULL,
    add_date date DEFAULT CURRENT_DATE NOT NULL,
    paid_date date,
    CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
);

CREATE TABLE industries (
    code TEXT PRIMARY KEY,
    industry TEXT NOT NULL UNIQUE
);

CREATE TABLE companies_industries (
    comp_code TEXT NOT NULL REFERENCES companies ON DELETE CASCADE,
    ind_code TEXT NOT NULL REFERENCES industries ON DELETE CASCADE,
    PRIMARY KEY(comp_code, ind_code)
);

INSERT INTO companies
  VALUES ('apple', 'Apple Computer', 'Maker of OSX.'),
         ('ibm', 'IBM', 'Big blue.'),
         ('acct-comp', 'Accounting Company', 'Some accounting done');

INSERT INTO invoices (comp_code, amt, paid, paid_date)
  VALUES ('apple', 100, false, null),
         ('apple', 200, false, null),
         ('apple', 300, true, '2018-01-01'),
         ('ibm', 400, false, null);

INSERT INTO industries (code, industry)
    VALUES ('cpt', 'Computing'),
           ('acct', 'Accounting'),
           ('tech', 'Big Tech'),
           ('data', 'Data');

INSERT INTO companies_industries (comp_code, ind_code)
    VALUES ('apple', 'cpt'),
           ('apple', 'tech'),
           ('ibm', 'cpt'),
           ('ibm', 'data'),
           ('acct-comp', 'acct');
