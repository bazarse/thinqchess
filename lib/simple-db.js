// Simple file-based database that mimics SQLite interface
import fs from 'fs';
import path from 'path';

class SimpleDatabase {
  constructor(dbPath) {
    this.dbPath = dbPath;
    this.dataPath = path.join(path.dirname(dbPath), 'data.json');
    this.data = this.loadData();
  }

  loadData() {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.log('Creating new database...');
    }
    
    return {
      admin_settings: [],
      tournaments: [],
      tournament_registrations: [],
      registrations: [],
      demo_requests: [],
      admin_users: [],
      discount_codes: [],
      gallery_images: [],
      blogs: []
    };
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataPath, JSON.stringify(this.data, null, 2));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  exec(sql, callback) {
    // For CREATE TABLE statements, just call callback
    if (callback) {
      callback(null);
    }
  }

  prepare(sql) {
    return {
      all: (...params) => {
        return this.executeQuery(sql, params, 'all');
      },
      get: (...params) => {
        return this.executeQuery(sql, params, 'get');
      },
      run: (...params) => {
        return this.executeQuery(sql, params, 'run');
      }
    };
  }

  executeQuery(sql, params = [], type = 'all') {
    const normalizedSql = sql.trim().toLowerCase();
    
    try {
      if (normalizedSql.startsWith('select')) {
        return this.handleSelect(sql, params, type);
      } else if (normalizedSql.startsWith('insert')) {
        return this.handleInsert(sql, params);
      } else if (normalizedSql.startsWith('update')) {
        return this.handleUpdate(sql, params);
      } else if (normalizedSql.startsWith('delete')) {
        return this.handleDelete(sql, params);
      }
      
      return type === 'all' ? [] : null;
    } catch (error) {
      console.error('Query execution error:', error);
      if (type === 'run') {
        return { changes: 0, lastInsertRowid: null };
      }
      return type === 'all' ? [] : null;
    }
  }

  handleSelect(sql, params, type) {
    // Extract table name
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) return type === 'all' ? [] : null;

    const tableName = tableMatch[1];
    let data = [...(this.data[tableName] || [])];

    // Handle WHERE conditions first
    if (sql.includes('WHERE') || sql.includes('where')) {
      data = this.applyWhereConditions(sql, params, data);
    }

    // Handle COUNT and SUM queries after filtering
    if (sql.includes('COUNT(*)') || sql.includes('count(*)')) {
      const count = data.length;
      let result = { count, total: count };

      // Handle SUM queries
      if (sql.includes('SUM(') || sql.includes('sum(')) {
        const sumMatch = sql.match(/SUM\(([^)]+)\)/i);
        if (sumMatch) {
          const field = sumMatch[1].trim();
          const sum = data.reduce((total, record) => {
            const value = parseFloat(record[field]) || 0;
            return total + value;
          }, 0);
          result.total_revenue = sum;
        }
      }

      return type === 'get' ? result : [result];
    }

    // Handle ORDER BY
    if (sql.includes('ORDER BY') || sql.includes('order by')) {
      data = this.applyOrderBy(sql, data);
    }

    // Handle LIMIT
    if (sql.includes('LIMIT') || sql.includes('limit')) {
      data = this.applyLimit(sql, data);
    }

    if (type === 'get') {
      return data[0] || null;
    }

    return data;
  }

  handleInsert(sql, params) {
    const tableMatch = sql.match(/into\s+(\w+)/i);
    if (!tableMatch) return { changes: 0, lastInsertRowid: null };

    const tableName = tableMatch[1];
    if (!this.data[tableName]) {
      this.data[tableName] = [];
    }

    // Generate new ID
    const newId = Math.max(0, ...this.data[tableName].map(row => row.id || 0)) + 1;

    // Extract column names and values
    const columnsMatch = sql.match(/\(([^)]+)\)\s*VALUES/i);
    if (!columnsMatch) return { changes: 0, lastInsertRowid: null };

    const columns = columnsMatch[1].split(',').map(col => col.trim().replace(/["`]/g, ''));

    // Create new record
    const newRecord = { id: newId };
    columns.forEach((col, index) => {
      if (params[index] !== undefined) {
        newRecord[col] = params[index];
      }
    });

    // Add timestamps for all tables
    newRecord.created_at = new Date().toISOString();
    if (tableName === 'admin_settings' || tableName === 'demo_requests' || tableName === 'tournaments') {
      newRecord.updated_at = new Date().toISOString();
    }

    this.data[tableName].push(newRecord);
    this.saveData();

    console.log(`✅ Inserted new ${tableName} record with ID: ${newId}`, newRecord);

    return { changes: 1, lastInsertRowid: newId };
  }

  handleUpdate(sql, params) {
    const tableMatch = sql.match(/update\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };

    const tableName = tableMatch[1];
    const data = this.data[tableName] || [];

    let changes = 0;

    // Handle SET clause
    const setMatch = sql.match(/set\s+(.+?)(?:\s+where|$)/i);
    if (setMatch) {
      const setClause = setMatch[1];

      // Simple update for is_active = 0 (deactivate all)
      if (setClause.includes('is_active = 0') && !sql.includes('WHERE')) {
        data.forEach(record => {
          record.is_active = 0;
          record.updated_at = new Date().toISOString();
          changes++;
        });
      } else if (sql.includes('WHERE') || sql.includes('where')) {
        // Apply WHERE conditions for specific updates
        const filteredData = this.applyWhereConditions(sql, params, data);
        filteredData.forEach(record => {
          // Parse SET values from params (simplified)
          if (setClause.includes('is_active = ?') && params.length > 0) {
            record.is_active = params[0];
          }
          if (setClause.includes('status = ?') && params.length > 1) {
            record.status = params[1];
          }
          record.updated_at = new Date().toISOString();
          changes++;
        });
      } else {
        // Handle general SET updates without WHERE
        const setFields = this.parseSetClause(setClause, params);
        data.forEach(record => {
          Object.keys(setFields).forEach(field => {
            record[field] = setFields[field];
          });
          record.updated_at = new Date().toISOString();
          changes++;
        });
      }
    }

    if (changes > 0) {
      this.saveData();
      console.log(`✅ Updated ${changes} ${tableName} records`);
    }

    return { changes };
  }

  parseSetClause(setClause, params) {
    const fields = {};
    let paramIndex = 0;

    // Handle common SET patterns
    if (setClause.includes('is_active = ?')) {
      fields.is_active = params[paramIndex++];
    }
    if (setClause.includes('status = ?')) {
      fields.status = params[paramIndex++];
    }
    if (setClause.includes('name = ?')) {
      fields.name = params[paramIndex++];
    }
    if (setClause.includes('description = ?')) {
      fields.description = params[paramIndex++];
    }
    if (setClause.includes('categories = ?')) {
      fields.categories = params[paramIndex++];
    }

    return fields;
  }

  handleDelete(sql, params) {
    const tableMatch = sql.match(/from\s+(\w+)/i);
    if (!tableMatch) return { changes: 0 };
    
    const tableName = tableMatch[1];
    const originalLength = (this.data[tableName] || []).length;
    
    if (sql.includes('WHERE') || sql.includes('where')) {
      // Apply WHERE conditions and remove matching records
      const toKeep = this.data[tableName].filter(record => {
        // Simple ID-based deletion
        if (params.length > 0 && sql.includes('id = ?')) {
          return record.id != params[0]; // Use loose comparison for ID matching
        }
        return true;
      });
      
      this.data[tableName] = toKeep;
      const changes = originalLength - toKeep.length;
      
      if (changes > 0) {
        this.saveData();
      }
      
      return { changes };
    }
    
    return { changes: 0 };
  }

  applyWhereConditions(sql, params, data) {
    let filteredData = [...data];

    // Extract WHERE clause and parse conditions more carefully
    const whereMatch = sql.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s*$)/i);
    if (!whereMatch) return filteredData;

    const whereClause = whereMatch[1];
    const conditions = whereClause.split(/\s+AND\s+/i);
    let paramIndex = 0;

    console.log(`🔍 WHERE clause: ${whereClause}`);
    console.log(`🔍 Conditions: ${JSON.stringify(conditions)}`);
    console.log(`🔍 Params: ${JSON.stringify(params)}`);

    for (const condition of conditions) {
      const trimmedCondition = condition.trim();

      if (trimmedCondition.includes('payment_status = ?')) {
        const value = params[paramIndex++];
        filteredData = filteredData.filter(record => record.payment_status == value);
        console.log(`🔍 Applied payment_status filter: ${value}, remaining: ${filteredData.length}`);
      }
      else if (trimmedCondition.includes('type = ?')) {
        const value = params[paramIndex++];
        filteredData = filteredData.filter(record => record.type == value);
        console.log(`🔍 Applied type filter: ${value}, remaining: ${filteredData.length}`);
      }
      else if (trimmedCondition.includes('tournament_id = ?')) {
        const tournamentId = params[paramIndex++];
        console.log(`🔍 Filtering by tournament_id: ${tournamentId}, paramIndex: ${paramIndex - 1}`);
        console.log(`🔍 Before filter: ${filteredData.length} records`);
        filteredData = filteredData.filter(record => {
          const match = record.tournament_id == tournamentId;
          if (match) {
            console.log(`✅ Match found: record.tournament_id=${record.tournament_id}, tournamentId=${tournamentId}`);
          }
          return match;
        });
        console.log(`🔍 After filter: ${filteredData.length} records`);
      }
      else if (trimmedCondition.includes('id = ?')) {
        const id = params[paramIndex++];
        filteredData = filteredData.filter(record => record.id == id);
      }
      else if (trimmedCondition.includes('is_active = 1')) {
        filteredData = filteredData.filter(record => record.is_active === 1 || record.is_active === true);
      }
      else if (trimmedCondition.includes('status = ?')) {
        const status = params[paramIndex++];
        filteredData = filteredData.filter(record => record.status == status);
      }
      else if (trimmedCondition.includes('LIKE')) {
        // Handle LIKE conditions for search
        const likeCount = (trimmedCondition.match(/LIKE \?/g) || []).length;
        for (let i = 0; i < likeCount; i++) {
          paramIndex++; // Skip LIKE parameters for now (complex to implement)
        }
      }
    }

    // Handle date comparisons for upcoming tournaments
    if (sql.includes('start_date > datetime(\'now\')')) {
      const now = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
      filteredData = filteredData.filter(record => record.start_date > now);
    }

    return filteredData;
  }

  applyOrderBy(sql, data) {
    if (sql.includes('ORDER BY created_at DESC') || sql.includes('order by created_at desc')) {
      return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    
    if (sql.includes('ORDER BY id DESC') || sql.includes('order by id desc')) {
      return data.sort((a, b) => b.id - a.id);
    }
    
    return data;
  }

  applyLimit(sql, data) {
    const limitMatch = sql.match(/limit\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1]);
      return data.slice(0, limit);
    }
    
    return data;
  }
}

export { SimpleDatabase as SimpleDB };
export default SimpleDatabase;
