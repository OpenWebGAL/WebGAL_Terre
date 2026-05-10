package com.openwebgal.terre.utils

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.widget.Toast
import androidx.core.net.toUri
import com.openwebgal.terre.R

object BrowserUtils {
    fun createBrowserIntent(url: String): Intent =
        Intent(Intent.ACTION_VIEW, url.toUri()).apply {
            addCategory(Intent.CATEGORY_BROWSABLE)
            setFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

    fun openBrowser(context: Context, url: String) {
        try {
            context.startActivity(createBrowserIntent(url))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(
                context,
                context.getString(R.string.could_not_open_browser),
                Toast.LENGTH_SHORT
            ).show()
        }
    }
}
