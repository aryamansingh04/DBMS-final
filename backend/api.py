from flask import Flask, request, jsonify
from flask_cors import CORS

from db_config import get_db_connection
from command_parser import parse_command


app = Flask(__name__)
CORS(app)


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/products", methods=["GET"])
def list_products():
    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT
                p.Product_ID,
                p.Product_Name,
                p.Current_Stock,
                COALESCE(c.Category_Name, 'Stationery') AS Category_Name
            FROM Product p
            LEFT JOIN Category c ON p.Category_ID = c.Category_ID
            """
        )
        rows = cursor.fetchall()

        products = [
            {
                "id": row[0],
                "name": row[1],
                "quantity": row[2],
                "category": row[3],
            }
            for row in rows
        ]

        return jsonify({"status": "success", "products": products})
    finally:
        cursor.close()
        db.close()


@app.route("/products/<int:product_id>", methods=["DELETE"])
def delete_product(product_id: int):
    db = get_db_connection()
    cursor = db.cursor()

    try:
        cursor.execute(
            """
            SELECT Product_Name
            FROM Product
            WHERE Product_ID = %s
            """,
            (product_id,),
        )
        row = cursor.fetchone()
        if not row:
            return jsonify({"status": "error", "message": "Product not found"}), 404

        name = row[0]

        cursor.execute(
            """
            DELETE FROM Product
            WHERE Product_ID = %s
            """,
            (product_id,),
        )
        db.commit()

        return jsonify({"status": "success", "message": f"Deleted product '{name}'"})
    finally:
        cursor.close()
        db.close()


@app.route("/voice-command", methods=["POST"])
def voice_command():
    payload = request.get_json(silent=True) or {}
    command = (payload.get("command") or "").strip()

    if not command:
        return jsonify({"status": "error", "message": "Command is required"}), 400

    db = get_db_connection()
    cursor = db.cursor()

    try:
        parsed = parse_command(command)
        action = parsed["action"]
        quantity = parsed["quantity"]
        product = parsed["product"]

        if action == "LOW_STOCK":
            cursor.execute(
                """
                SELECT Product_Name, Current_Stock
                FROM Stock_Status
                WHERE Stock_Status = 'LOW STOCK'
                """
            )
            results = cursor.fetchall()

            items = [
                {"product_name": row[0], "current_stock": row[1]}
                for row in results
            ]

            if not items:
                return jsonify(
                    {
                        "status": "success",
                        "action": action,
                        "message": "No low stock items",
                        "items": [],
                    }
                )

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": "Low stock items fetched",
                    "items": items,
                }
            )

        elif action == "ADD":
            cursor.execute(
                f"""
                SELECT Product_ID, Current_Stock
                FROM Product
                WHERE LOWER(Product_Name)=LOWER('{product}')
                """
            )
            result = cursor.fetchone()

            if result:
                product_id, old_stock = result

                cursor.execute(
                    f"""
                    UPDATE Product
                    SET Current_Stock = Current_Stock + {quantity}
                    WHERE Product_ID = {product_id}
                    """
                )
                db.commit()

                new_stock = old_stock + quantity

                return jsonify(
                    {
                        "status": "success",
                        "action": action,
                        "message": f"Added {quantity} to {product}",
                        "product_name": product,
                        "new_quantity": new_stock,
                    }
                )

            cursor.execute(
                f"""
                INSERT INTO Product
                (Product_ID, Product_Name, Unit_Price, Current_Stock, Reorder_Level, Category_ID, Supplier_ID)
                VALUES (
                    FLOOR(RAND()*100000),
                    '{product}',
                    10.00,
                    {quantity},
                    5,
                    1,
                    1
                )
                """
            )
            db.commit()

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": f"Created product '{product}' with {quantity} units",
                    "product_name": product,
                    "new_quantity": quantity,
                }
            )

        elif action == "REMOVE":
            cursor.execute(
                f"""
                SELECT Product_ID, Current_Stock
                FROM Product
                WHERE LOWER(Product_Name)=LOWER('{product}')
                """
            )
            result = cursor.fetchone()

            if not result:
                return jsonify(
                    {
                        "status": "error",
                        "action": action,
                        "message": "Product not found",
                    }
                )

            product_id, stock = result

            if stock < quantity:
                return jsonify(
                    {
                        "status": "error",
                        "action": action,
                        "message": "Not enough stock",
                    }
                )

            cursor.execute(
                f"""
                UPDATE Product
                SET Current_Stock = Current_Stock - {quantity}
                WHERE Product_ID = {product_id}
                """
            )
            db.commit()

            new_stock = stock - quantity

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": f"Removed {quantity} from {product}",
                    "product_name": product,
                    "new_quantity": new_stock,
                }
            )

        elif action == "UPDATE_STOCK":
            cursor.execute(
                f"""
                SELECT Product_ID, Current_Stock
                FROM Product
                WHERE LOWER(Product_Name)=LOWER('{product}')
                """
            )
            result = cursor.fetchone()

            if result:
                product_id, _old_stock = result

                cursor.execute(
                    f"""
                    UPDATE Product
                    SET Current_Stock = {quantity}
                    WHERE Product_ID = {product_id}
                    """
                )
                db.commit()

                return jsonify(
                    {
                        "status": "success",
                        "action": action,
                        "message": f"{product} quantity set to {quantity}",
                        "product_name": product,
                        "new_quantity": quantity,
                    }
                )

            cursor.execute(
                f"""
                INSERT INTO Product
                (Product_ID, Product_Name, Unit_Price, Current_Stock, Reorder_Level, Category_ID, Supplier_ID)
                VALUES (
                    FLOOR(RAND()*100000),
                    '{product}',
                    10.00,
                    {quantity},
                    5,
                    1,
                    1
                )
                """
            )
            db.commit()

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": f"Created product '{product}' with quantity {quantity}",
                    "product_name": product,
                    "new_quantity": quantity,
                }
            )

        elif action == "SHOW_EMPLOYEES":
            cursor.execute(
                """
                SELECT Employee_Name, Shift FROM Employee
                WHERE Shift='morning'
                """
            )
            results = cursor.fetchall()

            employees = [
                {"name": row[0], "shift": row[1]}
                for row in results
            ]

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": "Employees fetched",
                    "employees": employees,
                }
            )

        elif action == "ADD_EMPLOYEE":
            words = command.split()

            try:
                name = words[2]
                shift = words[3]
            except Exception:
                return jsonify(
                    {
                        "status": "error",
                        "action": action,
                        "message": "Format: add employee <name> <shift>",
                    }
                )

            cursor.execute(
                f"""
                INSERT INTO Employee (Employee_Name, Shift, Role)
                VALUES ('{name}', '{shift}', 'staff')
                """
            )
            db.commit()

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": f"Employee {name} added",
                }
            )

        elif action == "UPDATE_SHIFT":
            words = command.split()

            try:
                name = words[1]
                shift = words[-1]
            except Exception:
                return jsonify(
                    {
                        "status": "error",
                        "action": action,
                        "message": "Invalid format for update shift",
                    }
                )

            cursor.execute(
                f"""
                UPDATE Employee
                SET Shift='{shift}'
                WHERE LOWER(Employee_Name)=LOWER('{name}')
                """
            )
            db.commit()

            return jsonify(
                {
                    "status": "success",
                    "action": action,
                    "message": f"Updated {name} to {shift} shift",
                }
            )

        else:
            return jsonify(
                {
                    "status": "error",
                    "action": action,
                    "message": "Command not recognized",
                }
            )

    finally:
        cursor.close()
        db.close()


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)

