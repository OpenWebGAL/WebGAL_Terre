import java.security.MessageDigest
import java.net.URI
import org.apache.commons.compress.archivers.tar.TarArchiveInputStream
import org.apache.commons.compress.archivers.tar.TarArchiveEntry

buildscript {
    repositories {
        mavenCentral()
    }
    dependencies {
        classpath("org.apache.commons:commons-compress:1.28.0")
        classpath("org.tukaani:xz:1.12")
    }
}

abstract class DownloadNodejsTask : DefaultTask() {

    private val targetArchitectures = listOf("aarch64", "arm", "x86_64")
    private val architectureMap = mapOf(
        "aarch64" to "arm64-v8a",
        "arm" to "armeabi-v7a",
        "x86_64" to "x86_64",
    )

    @TaskAction
    fun run() {
        val baseUrl = "https://github.com/nini22P/termux-nodejs/releases/latest/download"

        val libnodeRoot = project.file("src/main/jniLibs")
        val assetsDir = project.file("src/main/assets")

        if (!assetsDir.exists()) assetsDir.mkdirs()

        val sha256Content = fetch("$baseUrl/sha256.txt")
        val expectedHashes = parseSha256Content(sha256Content, targetArchitectures)

        for (archKey in targetArchitectures) {
            val fileName = expectedHashes.keys.find { it.contains(archKey) } ?: continue
            val expectedHash = expectedHashes[fileName]!!
            val tarFile = File(assetsDir, fileName)

            val abi = architectureMap[archKey]!!
            val archDir = File(libnodeRoot, abi)

            val isTarInvalid = !tarFile.exists() || calculateSha256(tarFile) != expectedHash
            if (isTarInvalid) {
                downloadFile("$baseUrl/$fileName", tarFile)
                if (calculateSha256(tarFile) != expectedHash) throw GradleException("SHA256 failed: $fileName")
            }

            extractBin(tarFile, archDir)
        }
    }

    private fun extractBin(tarFile: File, archDir: File) {
        val binPrefix = "./data/data/com.termux/files/usr/bin/"

        val inputStream = tarFile.inputStream().buffered()

        val decompressed = when {
            tarFile.name.endsWith(".xz") ->
                org.apache.commons.compress.compressors.xz.XZCompressorInputStream(inputStream)
            tarFile.name.endsWith(".gz") ->
                java.util.zip.GZIPInputStream(inputStream)
            else -> inputStream
        }

        decompressed.use { comp ->
            TarArchiveInputStream(comp).use { tis ->
                var entry: TarArchiveEntry? = tis.nextEntry
                while (entry != null) {
                    val name = entry.name
                    if (name.startsWith(binPrefix)
                        && !entry.isDirectory
                        && !entry.isSymbolicLink
                    ) {
                        val fileName = name.substringAfterLast("/")
                        val targetFile = File(archDir, "lib$fileName.so")

                        val bytes = tis.readBytes()

                        val newHash = calculateSha256(bytes)

                        if (targetFile.exists()) {
                            val oldHash = calculateSha256(targetFile)

                            if (oldHash == newHash) {
                                entry = tis.nextEntry
                                continue
                            }
                        }

                        archDir.mkdirs()
                        targetFile.writeBytes(bytes)

                        println("Extracted: ${tarFile} -> $targetFile")
                    }

                    entry = tis.nextEntry
                }
            }
        }
    }

    private fun fetch(url: String): String {
        println("Fetching: $url")
        return URI.create(url).toURL().openStream().bufferedReader().use { it.readText() }
    }

    private fun downloadFile(url: String, target: File) {
        println("Downloading: $url")
        URI.create(url).toURL().openStream().use { input ->
            target.outputStream().use { output -> input.copyTo(output) }
        }
    }

    private fun parseSha256Content(content: String, architectures: List<String>): Map<String, String> {
        val hashes = mutableMapOf<String, String>()
        content.lines().forEach { line ->
            val parts = line.trim().split(Regex("\\s+"))
            if (parts.size >= 2) {
                val hash = parts[0]
                val name = parts[1].removePrefix("*")
                if (architectures.any { name.contains(it) }) hashes[name] = hash
            }
        }
        return hashes
    }

    private fun calculateSha256(file: File): String = calculateSha256(file.readBytes())

    private fun calculateSha256(data: ByteArray): String {
        val digest = MessageDigest.getInstance("SHA-256")
        return digest.digest(data).joinToString("") { "%02x".format(it) }
    }
}

tasks.register<DownloadNodejsTask>("downloadNodejs")

tasks.named("preBuild") {
    dependsOn("downloadNodejs")
}
