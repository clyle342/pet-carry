import {neon} from "@neondatabase/serverless";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            origin_address,
            destination_address,
            origin_latitude,
            origin_longitude,
            destination_latitude,
            destination_longitude,
            ride_time,
            fare_price,
            payment_status,
            driver_id,
            user_id,
            pet_name,
            species,
            size,
            crate_required,
            special_notes,
        } = body;

        if (
            !origin_address ||
            !destination_address ||
            !origin_latitude ||
            !origin_longitude ||
            !destination_latitude ||
            !destination_longitude ||
            !ride_time ||
            !fare_price ||
            !payment_status ||
            !driver_id ||
            !user_id ||
            !pet_name ||
            !species
        ) {
            return Response.json(
                {error: "Missing required fields"},
                {status: 400},
            );
        }

        const sql = neon(`${process.env.DATABASE_URL}`);

        const response = await sql`
        INSERT INTO rides ( 
          origin_address, 
          destination_address, 
          origin_latitude, 
          origin_longitude, 
          destination_latitude, 
          destination_longitude, 
          ride_time, 
          fare_price, 
          payment_status, 
          driver_id, 
          user_id,
          pet_name,
          species,
          size,
          crate_required,
          special_notes
        ) VALUES (
          ${origin_address},
          ${destination_address},
          ${origin_latitude},
          ${origin_longitude},
          ${destination_latitude},
          ${destination_longitude},
          ${ride_time},
          ${fare_price},
          ${payment_status},
          ${driver_id},
          ${user_id},
          ${pet_name},
          ${species},
          ${size},
          ${crate_required},
          ${special_notes}
        )
        RETURNING *;
        `;

        return Response.json({data: response[0]}, {status: 201});
    } catch (error) {
        console.error("Error inserting data into recent_rides:", error);
        return Response.json({error: "Internal Server Error"}, {status: 500});
    }
}
