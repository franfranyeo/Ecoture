import React, { useState } from "react";
import Dashboard from "../../Dashboard";
import AddProduct from "../../AddProduct";
import Products from "../../Products"; // Products component to manage and display products

function AdminProducts() {
  const [activeSection, setActiveSection] = useState("Product Management"); // Default to Product Management
  const [isAddingProduct, setIsAddingProduct] = useState(false); // To toggle Add Product form

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Main Content */}
      <div
        style={{
          flexGrow: 1,
          backgroundColor: "#fff",
        }}
      >
        {/* Render Product Management Section */}
        {activeSection === "Product Management" && (
          <>
            {!isAddingProduct ? (
              <>
                <h1
                  style={{
                    color: "#2c3e50",
                    fontSize: "32px",
                    fontWeight: "bold",
                    marginBottom: "16px",
                    textAlign: "left", // Align heading to the left
                  }}
                >
                  Product Management
                </h1>
                <Products
                  onAddProductClick={() => setIsAddingProduct(true)} // Show Add Product form
                />
              </>
            ) : (
              <>
                <h1
                  style={{
                    color: "#2c3e50",
                    fontSize: "32px",
                    marginBottom: "20px",
                  }}
                >
                  Add Product
                </h1>
                <button
                  style={{
                    backgroundColor: "#f44336",
                    color: "white",
                    padding: "10px 20px",
                    marginBottom: "20px",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                  onClick={() => setIsAddingProduct(false)} // Go back to Product Management
                >
                  Back to Product Management
                </button>
                <AddProduct /> {/* Render Add Product form */}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AdminProducts;
