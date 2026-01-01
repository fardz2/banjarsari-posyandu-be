import type { Context } from 'hono';
import { successResponse, errorResponse } from '../utils/response.helper.js';
import {
  getDashboardSummaryService,
  getGenderStatsService,
      getNutritionalStatsService,
      getNutritionalStatsByPosyanduService,
      getVisitTrendsService
    } from '../services/dashboard.service.js';
    import type { UserContext } from '../utils/permission.helper.js';
    
    export const getDashboardSummary = async (c: Context) => {
      try {
        const user = c.get('user') as UserContext;
        const stats = await getDashboardSummaryService(user);
        return successResponse(c, stats, { message: 'Dashboard summary retrieved' });
      } catch (error: any) {
        console.error('Error getDashboardSummary:', error);
        return errorResponse(c, 'Failed to get dashboard summary', { status: 500 });
      }
    };
    
    export const getGenderStats = async (c: Context) => {
      try {
        const user = c.get('user') as UserContext;
        const stats = await getGenderStatsService(user);
        return successResponse(c, stats, { message: 'Gender stats retrieved' });
      } catch (error: any) {
        console.error('Error getGenderStats:', error);
        return errorResponse(c, 'Failed to get gender stats', { status: 500 });
      }
    };
    
    export const getNutritionalStats = async (c: Context) => {
      try {
        const user = c.get('user') as UserContext;
        const stats = await getNutritionalStatsService(user);
        return successResponse(c, stats, { message: 'Nutritional stats retrieved' });
      } catch (error: any) {
        console.error('Error getNutritionalStats:', error);
        return errorResponse(c, 'Failed to get nutritional stats', { status: 500 });
      }
    };

    export const getNutritionalStatsByPosyandu = async (c: Context) => {
      try {
        const user = c.get('user') as UserContext;
        const stats = await getNutritionalStatsByPosyanduService(user);
        return successResponse(c, stats, { message: 'Nutritional stats by posyandu retrieved' });
      } catch (error: any) {
        console.error('Error getNutritionalStatsByPosyandu:', error);
        return errorResponse(c, 'Failed to get nutritional stats by posyandu', { status: 500 });
      }
    };

export const getVisitTrends = async (c: Context) => {
  try {
    const user = c.get('user') as UserContext;
    const stats = await getVisitTrendsService(user);
    return successResponse(c, stats, { message: 'Visit trends retrieved' });
  } catch (error: any) {
    console.error('Error getVisitTrends:', error);
    return errorResponse(c, 'Failed to get visit trends', { status: 500 });
  }
};
