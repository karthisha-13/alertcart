const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Product = sequelize.define('Product', {
  _id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product name is required' },
    },
  },
  productURL: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Product URL is required' },
    },
  },
  targetPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: { args: [0], msg: 'Target price must be positive' },
    },
    get() {
      const value = this.getDataValue('targetPrice');
      return value === null ? null : parseFloat(value);
    }
  },
  currentPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    defaultValue: null,
    get() {
      const value = this.getDataValue('currentPrice');
      return value === null ? null : parseFloat(value);
    }
  },
  userEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
    },
  },
  userPhone: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: null,
  },
  platform: {
    type: DataTypes.ENUM('amazon', 'flipkart', 'myntra', 'ajio', 'nykaa', 'tata', 'purplle', 'unknown'),
    defaultValue: 'unknown',
  },
  notified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  lastChecked: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: null,
  },
}, {
  hooks: {
    beforeSave: (product) => {
      const url = (product.productURL || '').toLowerCase();
      if (url.includes('amazon')) product.platform = 'amazon';
      else if (url.includes('flipkart')) product.platform = 'flipkart';
      else if (url.includes('myntra')) product.platform = 'myntra';
      else if (url.includes('ajio')) product.platform = 'ajio';
      else if (url.includes('nykaa')) product.platform = 'nykaa';
      else if (url.includes('tatacliq') || url.includes('1mg') || url.includes('tira')) product.platform = 'tata';
      else if (url.includes('purplle')) product.platform = 'purplle';
      else product.platform = 'unknown';
    }
  }
});

module.exports = Product;
