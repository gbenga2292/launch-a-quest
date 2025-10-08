import { Activity } from "@/types/asset";
import { api } from "@/services/api";

const apiActivityToActivity = (apiActivity: any): Activity => ({
  id: apiActivity.id,
  userId: apiActivity.user_id || '',
  userName: apiActivity.user_name,
  action: apiActivity.action as Activity['action'],
  entity: apiActivity.entity as Activity['entity'],
  entityId: apiActivity.entity_id,
  details: apiActivity.details,
  timestamp: new Date(apiActivity.timestamp)
});

// Sync localStorage activities to database when API is available
const syncLocalStorageActivities = async (): Promise<void> => {
  try {
    const localActivities: Activity[] = JSON.parse(localStorage.getItem('inventory-activities') || '[]');
    if (localActivities.length === 0) return;

    // Sync each local activity to database
    for (const activity of localActivities) {
      try {
        await api.createActivity({
          user_id: activity.userId,
          user_name: activity.userName,
          action: activity.action,
          entity: activity.entity,
          entity_id: activity.entityId,
          details: activity.details
        });
      } catch (error) {
        console.error('Failed to sync activity to database:', error);
        // Continue with next activity if one fails
      }
    }

    // Clear localStorage after successful sync
    localStorage.removeItem('inventory-activities');
    console.log(`Synced ${localActivities.length} activities from localStorage to database`);
  } catch (error) {
    console.error('Failed to sync localStorage activities:', error);
  }
};

export const logActivity = async (activity: Omit<Activity, 'id' | 'timestamp'>): Promise<void> => {
  try {
    await api.createActivity(activity);
    // Try to sync any pending localStorage activities
    await syncLocalStorageActivities();
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Fallback to localStorage if API fails
    const activities: Activity[] = JSON.parse(localStorage.getItem('inventory-activities') || '[]');
    const newActivity: Activity = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      ...activity
    };
    activities.unshift(newActivity);
    if (activities.length > 1000) {
      activities.length = 1000;
    }
    localStorage.setItem('inventory-activities', JSON.stringify(activities));
  }
};

export const getActivities = async (): Promise<Activity[]> => {
  try {
    const apiActivities = await api.getActivities();
    return apiActivities.map(apiActivityToActivity);
  } catch (error) {
    console.error('Failed to fetch activities from API:', error);
    // Fallback to localStorage if API fails
    return JSON.parse(localStorage.getItem('inventory-activities') || '[]');
  }
};

export const clearActivities = async (): Promise<void> => {
  try {
    // Note: This would require a new API endpoint to clear all activities
    // For now, we'll just clear localStorage as fallback
    localStorage.removeItem('inventory-activities');
  } catch (error) {
    console.error('Failed to clear activities:', error);
  }
};

export const exportActivitiesToTxt = async (): Promise<string> => {
  const activities = await getActivities();
  if (activities.length === 0) return "No activities logged.";

  let txt = "Inventory Activity Log\n";
  txt += "======================\n\n";

  activities.forEach(activity => {
    const date = activity.timestamp.toLocaleString();
    txt += `[${date}] User: ${activity.userName || activity.userId}\n`;
    txt += `Action: ${activity.action} on ${activity.entity}${activity.entityId ? ` (${activity.entityId})` : ''}\n`;
    txt += `Details: ${activity.details || 'N/A'}\n\n`;
  });

  return txt;
};
