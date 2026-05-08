package com.openwebgal.terre.utils

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.net.toUri
import com.openwebgal.terre.R

object BrowserUtils {
    fun openBrowser(context: Context, url: String) {
        val uri = url.toUri()
        try {
            val customTabsIntent = CustomTabsIntent.Builder().build()
            customTabsIntent.launchUrl(context, uri)
        } catch (e: Exception) {
            val intent = Intent(Intent.ACTION_VIEW, uri).apply {
                addCategory(Intent.CATEGORY_BROWSABLE)
                setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            try {
                context.startActivity(intent)
            } catch (e2: ActivityNotFoundException) {
                Toast.makeText(
                    context,
                    context.getString(R.string.could_not_open_browser),
                    Toast.LENGTH_SHORT
                ).show()
            }
        }
    }
}
