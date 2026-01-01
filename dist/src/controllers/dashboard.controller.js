import { successResponse, errorResponse } from '../utils/response.helper.js';
import { getDashboardSummaryService, getGenderStatsService, getNutritionalStatsService, getNutritionalStatsByPosyanduService, getVisitTrendsService } from '../services/dashboard.service.js';
export const getDashboardSummary = async (c) => {
    try {
        const user = c.get('user');
        const stats = await getDashboardSummaryService(user);
        return successResponse(c, stats, { message: 'Dashboard summary retrieved' });
    }
    catch (error) {
        console.error('Error getDashboardSummary:', error);
        return errorResponse(c, 'Failed to get dashboard summary', { status: 500 });
    }
};
export const getGenderStats = async (c) => {
    try {
        const user = c.get('user');
        const stats = await getGenderStatsService(user);
        return successResponse(c, stats, { message: 'Gender stats retrieved' });
    }
    catch (error) {
        console.error('Error getGenderStats:', error);
        return errorResponse(c, 'Failed to get gender stats', { status: 500 });
    }
};
export const getNutritionalStats = async (c) => {
    try {
        const user = c.get('user');
        const stats = await getNutritionalStatsService(user);
        return successResponse(c, stats, { message: 'Nutritional stats retrieved' });
    }
    catch (error) {
        console.error('Error getNutritionalStats:', error);
        return errorResponse(c, 'Failed to get nutritional stats', { status: 500 });
    }
};
export const getNutritionalStatsByPosyandu = async (c) => {
    try {
        const user = c.get('user');
        const stats = await getNutritionalStatsByPosyanduService(user);
        return successResponse(c, stats, { message: 'Nutritional stats by posyandu retrieved' });
    }
    catch (error) {
        console.error('Error getNutritionalStatsByPosyandu:', error);
        return errorResponse(c, 'Failed to get nutritional stats by posyandu', { status: 500 });
    }
};
export const getVisitTrends = async (c) => {
    try {
        const user = c.get('user');
        const stats = await getVisitTrendsService(user);
        return successResponse(c, stats, { message: 'Visit trends retrieved' });
    }
    catch (error) {
        console.error('Error getVisitTrends:', error);
        return errorResponse(c, 'Failed to get visit trends', { status: 500 });
    }
};
