import re

def parse_command(command):
    result = {
        "action": None,
        "quantity": 0,
        "product": None
    }

    command = command.lower()

    # Try explicit "update/set X (stock) to Y" style first so we get a good product name
    update_match = re.search(r"(?:update|set)\s+(.+?)\s+(?:stock\s+)?to\s+(\d+)", command)
    if update_match and "employee" not in command:
        result["action"] = "UPDATE_STOCK"
        result["product"] = update_match.group(1).strip()
        result["quantity"] = int(update_match.group(2))
        return result

    quantity_match = re.search(r"\d+", command)
    if quantity_match:
        result["quantity"] = int(quantity_match.group())

    words = command.split()

    if len(words) > 0:
        result["product"] = words[-1]

    # INVENTORY
    if "low stock" in command:
        result["action"] = "LOW_STOCK"

    elif "add" in command and "employee" not in command:
        result["action"] = "ADD"

    elif "remove" in command:
        result["action"] = "REMOVE"

    # EMPLOYEE
    elif "employee" in command:

        if "show" in command or "current shift" in command:
            result["action"] = "SHOW_EMPLOYEES"

        elif "add employee" in command:
            result["action"] = "ADD_EMPLOYEE"

        elif "update" in command and "shift" in command:
            result["action"] = "UPDATE_SHIFT"

    else:
        result["action"] = "UNKNOWN"

    return result