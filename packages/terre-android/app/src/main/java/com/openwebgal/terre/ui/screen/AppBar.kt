package com.openwebgal.terre.ui.screen

import android.content.Intent
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.core.net.toUri
import com.openwebgal.terre.R
import com.openwebgal.terre.service.TerreService

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppBar() {
    val context = LocalContext.current

    TopAppBar(
        title = { Text(stringResource(R.string.app_name)) },
        actions = {
            TextButton(
                onClick = {
                    val intent = Intent(Intent.ACTION_VIEW, "http://localhost:3001".toUri())
                    context.startActivity(intent)
                }
            ) {
                Text(stringResource(R.string.open_browser))
            }
            TextButton(onClick = {
                val serviceIntent = Intent(context, TerreService::class.java)
                context.stopService(serviceIntent)
            }) {
                Text(stringResource(R.string.stop))
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.inversePrimary
        )
    )
}