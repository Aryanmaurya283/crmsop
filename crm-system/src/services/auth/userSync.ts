import { supabase } from '../supabase';
import type { UserResource } from '@clerk/types';
import type { Database } from '../supabase/types';

export type UserSyncData = Database['public']['Tables']['users']['Insert'];
export type UserUpdateData = Database['public']['Tables']['users']['Update'];

export interface SyncResult {
  success: boolean;
  isNewUser: boolean;
  userId?: string;
  error?: string;
}

export const syncUserWithSupabase = async (clerkUser: UserResource): Promise<SyncResult> => {
  try {
    // Validate required user data
    if (!clerkUser.id) {
      throw new Error('Clerk user ID is required');
    }

    const primaryEmail = clerkUser.emailAddresses?.find(email => email.id === clerkUser.primaryEmailAddressId);
    if (!primaryEmail?.emailAddress) {
      throw new Error('User must have a primary email address');
    }

    // Get default role (sales_executive for new users)
    const { data: defaultRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'sales_executive')
      .single();

    if (roleError) {
      console.warn('Could not fetch default role:', roleError);
    }

    const userData: UserSyncData = {
      clerk_user_id: clerkUser.id,
      email: primaryEmail.emailAddress,
      first_name: clerkUser.firstName || '',
      last_name: clerkUser.lastName || '',
      image_url: clerkUser.imageUrl,
      role_id: defaultRole?.id || null,
      is_active: true,
    };

    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, role_id, is_active')
      .eq('clerk_user_id', clerkUser.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw new Error(`Failed to check existing user: ${fetchError.message}`);
    }

    if (existingUser) {
      // Update existing user but preserve role if already assigned
      const updateData: UserUpdateData = {
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        image_url: userData.image_url,
        last_login: new Date().toISOString(),
        is_active: true, // Reactivate user if they were deactivated
        updated_at: new Date().toISOString(),
      };

      const { error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('clerk_user_id', clerkUser.id);

      if (updateError) {
        throw new Error(`Failed to update user: ${updateError.message}`);
      }

      return {
        success: true,
        isNewUser: false,
        userId: existingUser.id,
      };
    } else {
      // Insert new user with default role
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert(userData)
        .select('id')
        .single();

      if (insertError) {
        throw new Error(`Failed to create user: ${insertError.message}`);
      }

      return {
        success: true,
        isNewUser: true,
        userId: newUser?.id,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to sync user with Supabase:', errorMessage);
    
    return {
      success: false,
      isNewUser: false,
      error: errorMessage,
    };
  }
};

export const getUserFromSupabase = async (clerkUserId: string) => {
  try {
    if (!clerkUserId) {
      throw new Error('Clerk user ID is required');
    }

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        role:roles(
          id,
          name,
          description,
          permissions
        ),
        team:teams(
          id,
          name,
          description
        )
      `)
      .eq('clerk_user_id', clerkUserId)
      .eq('is_active', true)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Failed to fetch user from Supabase:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const deactivateUser = async (clerkUserId: string): Promise<boolean> => {
  try {
    if (!clerkUserId) {
      throw new Error('Clerk user ID is required');
    }

    const { error } = await supabase
      .from('users')
      .update({ 
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      throw new Error(`Failed to deactivate user: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Failed to deactivate user:', error);
    return false;
  }
};