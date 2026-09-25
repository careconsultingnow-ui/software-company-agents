# ProGuard / R8 Rules for Automated Mileage & Expense Logger
# Optimized for release APK / AAB compilation

# General optimization settings
-repackageclasses ''
-allowaccessmodification

# AndroidX Room
-keep class androidx.room.RoomDatabase
-dontwarn androidx.room.paging.**
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao interface * { *; }
-keepclassmembers class * {
    @androidx.room.TypeConverter *;
}

# Keep Domain Entities & DAOs
-keep class com.softwarecompany.mileagetracker.data.local.entity.** { *; }
-keep class com.softwarecompany.mileagetracker.data.local.dao.** { *; }

# AndroidX WorkManager Workers
-keep class * extends androidx.work.ListenableWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}
-keep class com.softwarecompany.mileagetracker.engine.BackupWorker {
    public <init>(android.content.Context, androidx.work.WorkerParameters);
}

# Google Play Services: Location & Activity Recognition
-keep class com.google.android.gms.location.** { *; }
-dontwarn com.google.android.gms.location.**

# Kotlin Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}

# Preserve Line Numbers for Crash Reporting / Stack Traces
-keepattributes SourceFile,LineNumberTable
