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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppBar() {
    val context = LocalContext.current

    TopAppBar(
        title = { Text(stringResource(R.string.app_name)) },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = MaterialTheme.colorScheme.inversePrimary
        ),
        actions = {

            TextButton(
                onClick = {
                    val intent =
                        Intent(
                            Intent.ACTION_VIEW,
                            "https://github.com/OpenWebGAL/WebGAL_Terre".toUri()
                        )
                    context.startActivity(intent)
                }
            ) {
                Text("GitHub")
            }
        },
    )
}