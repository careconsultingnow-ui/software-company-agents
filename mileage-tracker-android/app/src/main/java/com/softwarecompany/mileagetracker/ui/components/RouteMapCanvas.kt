package com.softwarecompany.mileagetracker.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.*
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject

private val CanvasDarkBg = Color(0xFF0A0F1D)
private val GridLineColor = Color(0xFF1E293B)
private val StartPinColor = Color(0xFF10B981)
private val EndPinColor = Color(0xFFEF4444)
private val PolylineColorStart = Color(0xFF38BDF8)
private val PolylineColorEnd = Color(0xFF10B981)

data class GeoPoint(val lat: Double, val lng: Double)

/**
 * Lightweight, high-performance Canvas-based route visualizer.
 * Renders GPS waypoints with bounding-box aspect ratio normalization,
 * telemetry grid, and start/finish markers.
 */
@Composable
fun RouteMapCanvas(
    polylineJson: String,
    modifier: Modifier = Modifier
) {
    val points = remember(polylineJson) { parsePolylineJson(polylineJson) }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .height(200.dp)
            .clip(RoundedCornerShape(14.dp)),
        colors = CardDefaults.cardColors(containerColor = CanvasDarkBg)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val canvasWidth = size.width
                val canvasHeight = size.height

                // 1. Draw GPS Telemetry Grid Lines
                drawTelemetryGrid(canvasWidth, canvasHeight)

                if (points.size < 2) {
                    // Fallback visual representation if single point or zero points
                    drawSimulatedRoute(canvasWidth, canvasHeight)
                    return@Canvas
                }

                // 2. Compute Lat/Lng Bounding Box
                var minLat = Double.MAX_VALUE
                var maxLat = -Double.MAX_VALUE
                var minLng = Double.MAX_VALUE
                var maxLng = -Double.MAX_VALUE

                for (p in points) {
                    if (p.lat < minLat) minLat = p.lat
                    if (p.lat > maxLat) maxLat = p.lat
                    if (p.lng < minLng) minLng = p.lng
                    if (p.lng > maxLng) maxLng = p.lng
                }

                val latDelta = (maxLat - minLat).coerceAtLeast(0.0001)
                val lngDelta = (maxLng - minLng).coerceAtLeast(0.0001)

                val padding = 36f
                val drawWidth = canvasWidth - (padding * 2)
                val drawHeight = canvasHeight - (padding * 2)

                // Aspect ratio preservation
                val scale = minOf(drawWidth / lngDelta, drawHeight / latDelta)
                val offsetX = padding + (drawWidth - (lngDelta * scale)) / 2f
                val offsetY = padding + (drawHeight - (latDelta * scale)) / 2f

                fun toCanvasOffset(p: GeoPoint): Offset {
                    val x = (offsetX + (p.lng - minLng) * scale).toFloat()
                    // Invert Y axis because Canvas (0,0) is top-left
                    val y = (offsetY + (maxLat - p.lat) * scale).toFloat()
                    return Offset(x, y)
                }

                // 3. Build Polyline Path
                val path = Path()
                val firstOffset = toCanvasOffset(points.first())
                path.moveTo(firstOffset.x, firstOffset.y)

                for (i in 1 until points.size) {
                    val pt = toCanvasOffset(points[i])
                    path.lineTo(pt.x, pt.y)
                }

                // 4. Draw Path with Gradient Brush
                val gradientBrush = Brush.linearGradient(
                    colors = listOf(PolylineColorStart, PolylineColorEnd),
                    start = firstOffset,
                    end = toCanvasOffset(points.last())
                )

                // Glow shadow
                drawPath(
                    path = path,
                    brush = Brush.linearGradient(listOf(PolylineColorStart.copy(alpha = 0.3f), PolylineColorEnd.copy(alpha = 0.3f))),
                    style = Stroke(
                        width = 12f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                    )
                )

                // Sharp Polyline
                drawPath(
                    path = path,
                    brush = gradientBrush,
                    style = Stroke(
                        width = 5f,
                        cap = StrokeCap.Round,
                        join = StrokeJoin.Round
                    )
                )

                // 5. Draw Start Marker (Green Ring)
                drawCircle(
                    color = StartPinColor.copy(alpha = 0.35f),
                    radius = 14f,
                    center = firstOffset
                )
                drawCircle(
                    color = StartPinColor,
                    radius = 7f,
                    center = firstOffset
                )
                drawCircle(
                    color = Color.White,
                    radius = 3f,
                    center = firstOffset
                )

                // 6. Draw End Marker (Red Ring)
                val lastOffset = toCanvasOffset(points.last())
                drawCircle(
                    color = EndPinColor.copy(alpha = 0.35f),
                    radius = 14f,
                    center = lastOffset
                )
                drawCircle(
                    color = EndPinColor,
                    radius = 7f,
                    center = lastOffset
                )
                drawCircle(
                    color = Color.White,
                    radius = 3f,
                    center = lastOffset
                )
            }

            // Waypoint counter badge
            Surface(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(8.dp),
                color = Color.Black.copy(alpha = 0.6f),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = "${points.size} GPS fixes",
                    color = Color(0xFF94A3B8),
                    fontSize = 10.sp,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }
    }
}

private fun DrawScope.drawTelemetryGrid(width: Float, height: Float) {
    val step = 40f
    var x = step
    while (x < width) {
        drawLine(
            color = GridLineColor,
            start = Offset(x, 0f),
            end = Offset(x, height),
            strokeWidth = 1f
        )
        x += step
    }
    var y = step
    while (y < height) {
        drawLine(
            color = GridLineColor,
            start = Offset(0f, y),
            end = Offset(width, y),
            strokeWidth = 1f
        )
        y += step
    }
}

private fun DrawScope.drawSimulatedRoute(width: Float, height: Float) {
    val start = Offset(width * 0.2f, height * 0.7f)
    val control = Offset(width * 0.5f, height * 0.2f)
    val end = Offset(width * 0.8f, height * 0.4f)

    val path = Path().apply {
        moveTo(start.x, start.y)
        quadraticBezierTo(control.x, control.y, end.x, end.y)
    }

    drawPath(
        path = path,
        color = PolylineColorStart.copy(alpha = 0.7f),
        style = Stroke(
            width = 4f,
            pathEffect = PathEffect.dashPathEffect(floatArrayOf(12f, 8f))
        )
    )

    drawCircle(StartPinColor, radius = 6f, center = start)
    drawCircle(EndPinColor, radius = 6f, center = end)
}

private fun parsePolylineJson(json: String): List<GeoPoint> {
    val result = mutableListOf<GeoPoint>()
    if (json.isBlank()) return result
    try {
        val array = JSONArray(json)
        for (i in 0 until array.length()) {
            val obj = array.optJSONObject(i) ?: continue
            val lat = obj.optDouble("lat", Double.NaN)
            val lng = obj.optDouble("lng", Double.NaN)
            if (!lat.isNaN() && !lng.isNaN()) {
                result.add(GeoPoint(lat, lng))
            }
        }
    } catch (_: Exception) {
        // Safe catch on malformed input
    }
    return result
}
