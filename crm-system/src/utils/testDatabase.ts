import { supabase } from '../services/supabase';

export interface DatabaseTestResult {
  success: boolean;
  message: string;
  details?: any;
}

export class DatabaseTester {
  /**
   * Test basic database connection
   */
  static async testConnection(): Promise<DatabaseTestResult> {
    try {
      const { data, error } = await supabase
        .from('roles')
        .select('count')
        .limit(1);

      if (error) {
        return {
          success: false,
          message: 'Database connection failed',
          details: error,
        };
      }

      return {
        success: true,
        message: 'Database connection successful',
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Database connection error',
        details: error,
      };
    }
  }

  /**
   * Test if all required tables exist
   */
  static async testTables(): Promise<DatabaseTestResult> {
    const requiredTables = [
      'users', 'roles', 'teams', 'leads', 'lead_sources', 
      'lead_campaigns', 'contacts', 'accounts', 'deals', 'projects'
    ];

    try {
      const results = await Promise.all(
        requiredTables.map(async (table) => {
          const { error } = await supabase
            .from(table)
            .select('*')
            .limit(1);
          return { table, exists: !error };
        })
      );

      const missingTables = results.filter(r => !r.exists).map(r => r.table);

      if (missingTables.length > 0) {
        return {
          success: false,
          message: `Missing tables: ${missingTables.join(', ')}`,
          details: results,
        };
      }

      return {
        success: true,
        message: 'All required tables exist',
        details: results,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Table verification failed',
        details: error,
      };
    }
  }

  /**
   * Test if default data exists
   */
  static async testDefaultData(): Promise<DatabaseTestResult> {
    try {
      const [rolesResult, sourcesResult] = await Promise.all([
        supabase.from('roles').select('count'),
        supabase.from('lead_sources').select('count'),
      ]);

      const issues = [];
      
      if (rolesResult.error || !rolesResult.data || rolesResult.data.length === 0) {
        issues.push('No default roles found');
      }

      if (sourcesResult.error || !sourcesResult.data || sourcesResult.data.length === 0) {
        issues.push('No default lead sources found');
      }

      if (issues.length > 0) {
        return {
          success: false,
          message: issues.join(', '),
          details: { rolesResult, sourcesResult },
        };
      }

      return {
        success: true,
        message: 'Default data exists',
        details: { rolesResult, sourcesResult },
      };
    } catch (error) {
      return {
        success: false,
        message: 'Default data verification failed',
        details: error,
      };
    }
  }

  /**
   * Test database functions
   */
  static async testFunctions(): Promise<DatabaseTestResult> {
    try {
      // Test a simple function call
      const { data, error } = await supabase.rpc('get_user_role', {
        user_clerk_id: 'test_user_id'
      });

      // We expect this to return null for a non-existent user, but no error
      if (error && !error.message.includes('not found')) {
        return {
          success: false,
          message: 'Database functions not working',
          details: error,
        };
      }

      return {
        success: true,
        message: 'Database functions are working',
        details: data,
      };
    } catch (error) {
      return {
        success: false,
        message: 'Function test failed',
        details: error,
      };
    }
  }

  /**
   * Run all database tests
   */
  static async runAllTests(): Promise<{
    overall: boolean;
    results: Record<string, DatabaseTestResult>;
  }> {
    const tests = {
      connection: await this.testConnection(),
      tables: await this.testTables(),
      defaultData: await this.testDefaultData(),
      functions: await this.testFunctions(),
    };

    const overall = Object.values(tests).every(test => test.success);

    return {
      overall,
      results: tests,
    };
  }
}