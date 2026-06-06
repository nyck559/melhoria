package com.sololeveling.lifesystem;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.widget.RemoteViews;

import org.json.JSONArray;
import org.json.JSONObject;

/** Home-screen widget showing today's checklist progress and tasks. */
public class ChecklistWidget extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager manager, int[] ids) {
        for (int id : ids) render(context, manager, id);
    }

    static void render(Context ctx, AppWidgetManager manager, int id) {
        RemoteViews views = new RemoteViews(ctx.getPackageName(), R.layout.widget_checklist);

        SharedPreferences sp = ctx.getSharedPreferences("widget_prefs", Context.MODE_PRIVATE);
        String data = sp.getString("checklist", "{}");

        int done = 0, total = 0;
        StringBuilder sb = new StringBuilder();
        try {
            JSONObject o = new JSONObject(data);
            done = o.optInt("done", 0);
            total = o.optInt("total", 0);
            JSONArray arr = o.optJSONArray("tasks");
            if (arr != null) {
                for (int i = 0; i < arr.length() && i < 8; i++) {
                    JSONObject t = arr.getJSONObject(i);
                    boolean d = t.optBoolean("done", false);
                    sb.append(d ? "☑  " : "☐  ").append(t.optString("nome", "")).append("\n");
                }
            }
        } catch (Exception ignored) {}

        views.setTextViewText(R.id.widget_progress, done + "/" + total);
        String list = sb.toString().trim();
        views.setTextViewText(R.id.widget_tasks, list.length() > 0 ? list : "Abra o app para sincronizar suas tarefas.");

        Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (open != null) {
            PendingIntent pi = PendingIntent.getActivity(
                ctx, 0, open,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            views.setOnClickPendingIntent(R.id.widget_root, pi);
        }

        manager.updateAppWidget(id, views);
    }
}
