package com.openwebgal.terre.utils

import android.content.Context
import android.system.Os
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import org.tukaani.xz.XZInputStream
import java.io.BufferedInputStream
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

object ArchiveUtils {

    fun unTar(context: Context, assetName: String, toPath: String) {
        try {
            val tarInputStream =
                TarArchiveInputStream(BufferedInputStream(context.assets.open(assetName)))
            tarInputStream.use { tis ->
                var entry = tis.nextTarEntry
                while (entry != null) {
                    val destPath = File(toPath, entry.name)
                    if (!destPath.canonicalPath.startsWith(File(toPath).canonicalPath)) {
                        throw IOException("Path traversal detected: ${entry.name}")
                    }
                    if (entry.isDirectory) {
                        destPath.mkdirs()
                    } else {
                        destPath.parentFile?.mkdirs()
                        val fos = FileOutputStream(destPath)
                        fos.use {
                            tis.copyTo(it)
                        }
                    }
                    entry = tis.nextTarEntry
                }
            }
        } catch (e: IOException) {
            e.printStackTrace()
        }
    }

    fun unTarXz(
        context: Context,
        assetName: String,
        toPath: String,
        prefix: String? = null
    ) {
        context.assets.open(assetName).use { fileStream ->
            XZInputStream(fileStream).use { xzIn ->
                TarArchiveInputStream(xzIn).use { tar ->
                    var entry = tar.nextTarEntry

                    while (entry != null) {
                        var name = entry.name

                        if (name.startsWith("./")) {
                            name = name.removePrefix("./")
                        }

                        val relativePath = if (!prefix.isNullOrEmpty()) {
                            if (!name.startsWith(prefix)) {
                                entry = tar.nextTarEntry
                                continue
                            }
                            name.removePrefix(prefix)
                        } else {
                            name
                        }

                        val destFile = File(toPath, relativePath)
                        if (!destFile.canonicalPath.startsWith(File(toPath).canonicalPath)) {
                            throw IOException("Path traversal detected: $name")
                        }

                        when {
                            entry.isDirectory -> {
                                destFile.mkdirs()
                            }

                            entry.isSymbolicLink -> {
                                destFile.parentFile?.mkdirs()
                                try {
                                    val targetName = entry.linkName
                                    if (targetName.isNotEmpty()) {
                                        if (destFile.exists()) destFile.delete()
                                        Os.symlink(targetName, destFile.absolutePath)
                                    }
                                } catch (e: Exception) {
                                    println("Failed symlink: ${entry.name} -> ${entry.linkName}: ${e.message}")
                                }
                            }

                            else -> {
                                destFile.parentFile?.mkdirs()

                                FileOutputStream(destFile).use { out ->
                                    tar.copyTo(out)
                                }

                                if ((entry.mode and 0x40) != 0) {
                                    destFile.setExecutable(true)
                                }
                            }
                        }

                        entry = tar.nextTarEntry
                    }
                }
            }
        }
    }
}
