import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserService } from '../services/users';

export interface UserTeam {
  team_id: string;
  team_name: string;
  team_description: string;
  membership_role: string;
  is_manager: boolean;
}

export const useUserTeams = () => {
  const { userId, isSignedIn } = useAuth();
  const [teams, setTeams] = useState<UserTeam[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTeams = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    try {
      setIsLoading(true);
      setError(null);

      const teamsData = await UserService.getUserTeams(userId);
      setTeams(teamsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load teams';
      setError(errorMessage);
      console.error('Error loading teams:', err);
    } finally {
      setIsLoading(false);
    }
  }, [userId, isSignedIn]);

  const loadTeamMembers = useCallback(async () => {
    if (!isSignedIn || !userId) return;

    try {
      const membersData = await UserService.getTeamMembers(userId);
      setTeamMembers(membersData);
    } catch (err) {
      console.error('Error loading team members:', err);
    }
  }, [userId, isSignedIn]);

  useEffect(() => {
    loadTeams();
    loadTeamMembers();
  }, [loadTeams, loadTeamMembers]);

  const refresh = useCallback(() => {
    loadTeams();
    loadTeamMembers();
  }, [loadTeams, loadTeamMembers]);

  // Team role helpers
  const isManager = useCallback(() => {
    return teams.some(team => team.is_manager);
  }, [teams]);

  const isTeamLead = useCallback(() => {
    return teams.some(team => team.membership_role === 'lead');
  }, [teams]);

  const getTeamsByRole = useCallback((role: string) => {
    return teams.filter(team => team.membership_role === role);
  }, [teams]);

  const getPrimaryTeam = useCallback(() => {
    // Return the first team where user is a manager, or the first team
    return teams.find(team => team.is_manager) || teams[0] || null;
  }, [teams]);

  const getTeamMembersByRole = useCallback((role?: string) => {
    if (!role) return teamMembers;
    return teamMembers.filter(member => member.role?.name === role);
  }, [teamMembers]);

  const getActiveTeamMembers = useCallback(() => {
    return teamMembers.filter(member => member.is_active);
  }, [teamMembers]);

  return {
    teams,
    teamMembers,
    isLoading,
    error,
    refresh,
    // Helper functions
    isManager: isManager(),
    isTeamLead: isTeamLead(),
    getTeamsByRole,
    getPrimaryTeam,
    getTeamMembersByRole,
    getActiveTeamMembers,
    // Computed properties
    totalTeams: teams.length,
    totalTeamMembers: teamMembers.length,
    hasTeams: teams.length > 0,
    hasTeamMembers: teamMembers.length > 0,
    primaryTeam: getPrimaryTeam(),
    managedTeams: teams.filter(team => team.is_manager),
  };
};