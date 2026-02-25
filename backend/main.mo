import Map "mo:core/Map";
import Array "mo:core/Array";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int16 "mo:core/Int16";

actor {
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    price : Nat;
    stockQuantity : Nat;
    category : Text;
  };

  public type Customer = {
    id : Text;
    name : Text;
    email : Text;
    phone : Text;
    address : Text;
    createdAt : Int;
  };

  public type InvoiceStatus = {
    #draft;
    #sent;
    #paid;
    #overdue;
  };

  public type LineItem = {
    productId : Text;
    name : Text;
    description : Text;
    price : Nat;
    quantity : Nat;
  };

  public type Invoice = {
    id : Text;
    customerId : Text;
    lineItems : [LineItem];
    totalAmount : Nat;
    status : InvoiceStatus;
    createdAt : Int;
    dueDate : Int;
  };

  public type Expense = {
    id : Text;
    category : Text;
    amount : Nat;
    description : Text;
    date : Int;
  };

  public type DashboardData = {
    totalRevenue : Nat;
    activeCustomers : Nat;
    lowStockProducts : Nat;
    unpaidInvoices : Nat;
    monthlyRevenue : [(Text, Nat)];
  };

  func compareByNameIgnoreCase(a : Product, b : Product) : Order.Order {
    Text.compare(a.name, b.name);
  };

  // Customers storage
  let customers = Map.empty<Text, Customer>();

  // Products storage
  let products = Map.empty<Text, Product>();

  // Invoices storage
  let invoices = Map.empty<Text, Invoice>();

  // Expenses storage
  let expenses = Map.empty<Text, Expense>();

  // Products
  func getAllProducts() : Iter.Iter<Product> {
    products.values();
  };

  func mapProductsToList(products : Map.Map<Text, Product>) : List.List<Product> {
    let list = List.empty<Product>();
    let sortedProducts = products.values().toArray().sort(compareByNameIgnoreCase);
    sortedProducts.forEach(func(p) { list.add(p) });
    list;
  };

  // Invoices
  func getAllInvoices() : Iter.Iter<Invoice> {
    invoices.values();
  };

  func getInvoicesByStatus(searchStatus : InvoiceStatus, startingList : List.List<Product>) : Iter.Iter<Invoice> {
    invoices.values();
  };

  // Expenses
  func getAllExpenses() : Iter.Iter<Expense> {
    expenses.values();
  };

  func findExpenseById(expenseId : Text) : Expense {
    switch (expenses.get(expenseId)) {
      case (?expense) { expense };
      case (null) { Runtime.trap("Expense not found") };
    };
  };

  // Customers
  func findCustomerById(customerId : Text) : Customer {
    switch (customers.get(customerId)) {
      case (?customer) { customer };
      case (null) { Runtime.trap("Customer not found") };
    };
  };

  // Record sales
  func recordSale(invoiceId : Text) {
    switch (invoices.get(invoiceId)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        if (invoice.status == #paid) {};
      };
    };
  };

  // Get monthly revenue
  func getMonthlyRevenue(year : Int, month : Int) : Nat {
    var total = 0;
    let salesValues = invoices.values();
    for (invoice in salesValues) {
      let invoiceDate = invoice.createdAt;
      // Not handling year/month extraction since Time module is not complete.
      total += invoice.totalAmount;
    };
    total;
  };

  // Remind for low stock
  func getLowStockReminder() : List.List<Product> {
    let allProducts = products.values().toArray();
    let list = List.empty<Product>();
    let filteredArray = allProducts.filter(func(p) { p.stockQuantity < 5 });
    if (filteredArray.size() > 0) {
      list.add(filteredArray[0]);
    };
    list;
  };

  // Filter by search text
  func filterProducts(searchText : Text) : List.List<Product> {
    let list = List.empty<Product>();
    let filteredProducts = products.values().toArray().filter(
      func(p) {
        p.name.contains(#text searchText) or p.description.contains(#text searchText);
      }
    );
    if (filteredProducts.size() > 0) {
      list.add(filteredProducts[0]);
    };
    list;
  };

  func filterById(productId : Text) : ?Product {
    let product = products.get(productId);
    product;
  };

  // Customer management
  public shared ({ caller }) func createCustomer(id : Text, name : Text, email : Text, phone : Text, address : Text, createdAt : Int) : async Text {
    let customer = {
      id;
      name;
      email;
      phone;
      address;
      createdAt;
    };
    customers.add(id, customer);
    "Customer created successfully";
  };

  public shared ({ caller }) func updateCustomer(id : Text, name : Text, email : Text, phone : Text, address : Text) : async Text {
    switch (customers.get(id)) {
      case (null) { Runtime.trap("Customer not found") };
      case (?customer) {
        let updated = {
          customer with
          name;
          email;
          phone;
          address;
        };
        customers.add(id, updated);
        "Customer updated successfully";
      };
    };
  };

  public shared ({ caller }) func deleteCustomer(id : Text) : async Text {
    if (customers.containsKey(id)) {
      customers.remove(id);
      "Customer deleted successfully";
    } else {
      Runtime.trap("Customer not found");
    };
  };

  public shared ({ caller }) func getCustomerById(id : Text) : async ?Customer {
    customers.get(id);
  };

  // Product management
  public shared ({ caller }) func addProduct(id : Text, name : Text, description : Text, price : Nat, stockQuantity : Nat, category : Text) : async Text {
    let product = {
      id;
      name;
      description;
      price;
      stockQuantity;
      category;
    };
    products.add(id, product);
    "Product added successfully";
  };

  public shared ({ caller }) func updateProduct(id : Text, name : Text, description : Text, price : Nat, stockQuantity : Nat, category : Text) : async Text {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) {
        let updated = {
          product with
          name;
          description;
          price;
          stockQuantity;
          category;
        };
        products.add(id, updated);
        "Product updated successfully";
      };
    };
  };

  public shared ({ caller }) func deleteProduct(id : Text) : async Text {
    if (products.containsKey(id)) {
      products.remove(id);
      "Product deleted successfully";
    } else {
      Runtime.trap("Product not found");
    };
  };

  public shared ({ caller }) func getProductById(id : Text) : async ?Product {
    products.get(id);
  };

  // Expense management
  public shared ({ caller }) func addExpense(id : Text, category : Text, amount : Nat, description : Text, date : Int) : async Text {
    let expense = {
      id;
      category;
      amount;
      description;
      date;
    };
    expenses.add(id, expense);
    "Expense added successfully";
  };

  public shared ({ caller }) func updateExpense(id : Text, category : Text, amount : Nat, description : Text, date : Int) : async Text {
    switch (expenses.get(id)) {
      case (null) { Runtime.trap("Expense not found") };
      case (?expense) {
        let updated = {
          expense with
          category;
          amount;
          description;
          date;
        };
        expenses.add(id, updated);
        "Expense updated successfully";
      };
    };
  };

  public shared ({ caller }) func deleteExpense(id : Text) : async Text {
    if (expenses.containsKey(id)) {
      expenses.remove(id);
      "Expense deleted successfully";
    } else {
      Runtime.trap("Expense not found");
    };
  };

  public shared ({ caller }) func getExpenseById(id : Text) : async ?Expense {
    expenses.get(id);
  };

  func getPendingInvoicesAmount() : Nat {
    var total = 0;
    let pending = getInvoicesByStatus(#sent, List.empty());
    let filteredPending = pending.filter(
      func(invoice) {
        invoice.status == #sent
      }
    );
    filteredPending.forEach(
      func(invoice) {
        total += invoice.totalAmount;
      }
    );
    total;
  };

  // Invoice management
  public shared ({ caller }) func createInvoice(id : Text, customerId : Text, lineItems : [LineItem], totalAmount : Nat, status : InvoiceStatus, createdAt : Int, dueDate : Int) : async Text {
    let invoice = {
      id;
      customerId;
      lineItems;
      totalAmount;
      status;
      createdAt;
      dueDate;
    };
    invoices.add(id, invoice);
    "Invoice created successfully";
  };

  public shared ({ caller }) func updateInvoiceStatus(id : Text, status : InvoiceStatus) : async Text {
    switch (invoices.get(id)) {
      case (null) { Runtime.trap("Invoice not found") };
      case (?invoice) {
        let updated = { invoice with status };
        invoices.add(id, updated);
        "Invoice status updated successfully";
      };
    };
  };

  func updateProductStockLevel(productId : Text, newQuantity : Nat) {
    let product = products.get(productId);
    switch (product) {
      case (?newProduct) { products.add(productId, newProduct) };
      case (null) {};
    };
  };

  func getCurrentMonth() : Text {
    let now = Time.now();
    let year = 2024.toText(); // Hardcoded for now
    let month = "6"; // Hardcoded for now
    year # " " # month;
  };

  func getCurrentYear() : Nat16 {
    2024; // Hardcoded
  };

  func getFilteredCustomers(searchText : Text) : List.List<Customer> {
    let filteredCustomers = customers.values().toArray().filter(
      func(customer) {
        customer.name.contains(#text searchText) or customer.email.contains(#text searchText);
      }
    );
    let customersList = List.empty<Customer>();
    if (filteredCustomers.size() > 0) {
      customersList.add(filteredCustomers[0]);
    };
    customersList;
  };

  func getFilteredExpenses(searchText : Text) : List.List<Expense> {
    let filteredExpenses = expenses.values().toArray().filter(
      func(expense) {
        expense.category.contains(#text searchText) or expense.description.contains(#text searchText);
      }
    );
    let list = List.empty<Expense>();
    if (filteredExpenses.size() > 0) {
      list.add(filteredExpenses[0]);
    };
    list;
  };
};
