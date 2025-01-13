class CartBucketService {
  async addItemToBucket(item) {
    const items = (await JSON.parse(localStorage.getItem("cart"))) || [];
    items.push(item);
    localStorage.setItem("cart", JSON.stringify(items));
    return true;
  }

  async updateItems(items) {
    localStorage.setItem("cart", JSON.stringify(items));
    return true;
  }

  async getItemsFromBucket() {
    return JSON.parse(localStorage.getItem("cart"));
  }

  async getItemsCount() {
    const items = localStorage.getItem("cart");
    if (items) {
      return JSON.parse(items).length;
    }
    return 0;
  }

  async removeItemFromBucket(itemId) {
    const items = await JSON.parse(localStorage.getItem("cart"));
    const newItems = items.filter((item) => item._id !== itemId);
    localStorage.setItem("cart", JSON.stringify(newItems));
    return newItems;
  }
}

export default new CartBucketService();
