import { supabase } from './supabase';

// Save tournament registration to Supabase
export const saveRegistration = async (registrationData) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        type: 'tournament',
        participant_first_name: registrationData.participant_first_name,
        participant_last_name: registrationData.participant_last_name,
        email: registrationData.email,
        phone: registrationData.phone,
        dob: registrationData.dob,
        gender: registrationData.gender,
        fida_id: registrationData.fida_id,
        country: registrationData.country,
        state: registrationData.state,
        city: registrationData.city,
        location: registrationData.location,
        amount_paid: registrationData.amount_paid,
        discount_code: registrationData.discount_code,
        discount_amount: registrationData.discount_amount,
        payment_id: registrationData.payment_id,
        razorpay_order_id: registrationData.razorpay_order_id,
        payment_status: registrationData.payment_status,
        registered_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase registration error:', error);
      throw error;
    }

    console.log('✅ Registration saved to Supabase:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error saving registration:', error);
    throw error;
  }
};

// Get all registrations for admin panel
export const getAllRegistrations = async () => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .select('*')
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error getting registrations:', error);
    return [];
  }
};

// Get registrations with real-time updates
export const subscribeToRegistrations = (callback) => {
  const subscription = supabase
    .channel('registrations')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'registrations' 
      }, 
      (payload) => {
        console.log('Registration update:', payload);
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
};

// Save course registration
export const saveCourseRegistration = async (registrationData) => {
  try {
    const { data, error } = await supabase
      .from('registrations')
      .insert([{
        type: 'course',
        participant_first_name: registrationData.participant_first_name,
        participant_last_name: registrationData.participant_last_name,
        email: registrationData.email,
        phone: registrationData.phone,
        age: registrationData.age,
        course_type: registrationData.course_type,
        amount_paid: registrationData.amount_paid,
        payment_id: registrationData.payment_id,
        payment_status: registrationData.payment_status,

        // Store additional course data as JSON
        additional_data: registrationData.additional_data,

        registered_at: new Date().toISOString()
      }])
      .select();

    if (error) {
      console.error('Supabase course registration error:', error);
      throw error;
    }

    console.log('✅ Course registration saved to Supabase:', data[0]);
    return data[0];
  } catch (error) {
    console.error('Error saving course registration:', error);
    throw error;
  }
};
