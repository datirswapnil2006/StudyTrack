import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getTemplateTasks } from '../utils/timetableDefaults';
import { getKolkataDateString } from '../utils/dateUtils';

// Local storage fallback storage keys
const LS_KEYS = {
  DAYS: 'sp_study_days',
  TASKS: 'sp_daily_tasks',
  MISTAKES: 'sp_coding_mistakes',
  TOPICS: 'sp_difficult_topics',
  REVISIONS: 'sp_revision_logs',
  GOALS: 'sp_report_goals'
};

const getLocal = (key) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('LocalStorage read error:', e);
    return [];
  }
};

const setLocal = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
};

// ==========================================
// 1. STUDY DAYS
// ==========================================
export async function getStudyDay(userId, date) {
  if (!userId || !date) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('study_days')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Error fetching study day from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const days = getLocal(LS_KEYS.DAYS);
  return days.find((d) => d.user_id === userId && d.date === date) || null;
}

export async function saveStudyDay(userId, { date, template_type, notes = '', sleep_hours = null }) {
  if (!userId || !date) throw new Error('User ID and Date required');

  if (isSupabaseConfigured()) {
    try {
      const existing = await getStudyDay(userId, date);
      if (existing) {
        const { data, error } = await supabase
          .from('study_days')
          .update({
            template_type,
            notes,
            sleep_hours,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('study_days')
          .insert({
            user_id: userId,
            date,
            template_type,
            notes,
            sleep_hours
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error saving study day to Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const days = getLocal(LS_KEYS.DAYS);
  const existingIdx = days.findIndex((d) => d.user_id === userId && d.date === date);
  const now = new Date().toISOString();
  let dayRecord;

  if (existingIdx >= 0) {
    dayRecord = {
      ...days[existingIdx],
      template_type,
      notes,
      sleep_hours,
      updated_at: now
    };
    days[existingIdx] = dayRecord;
  } else {
    dayRecord = {
      id: `day_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      user_id: userId,
      date,
      template_type,
      notes,
      sleep_hours,
      created_at: now,
      updated_at: now
    };
    days.push(dayRecord);
  }

  setLocal(LS_KEYS.DAYS, days);
  return dayRecord;
}

// ==========================================
// 2. DAILY TASK RECORDS
// ==========================================
export async function getDailyTasks(userId, date) {
  if (!userId || !date) return [];

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('daily_task_records')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .order('task_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching daily tasks from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const tasks = getLocal(LS_KEYS.TASKS);
  return tasks
    .filter((t) => t.user_id === userId && t.date === date)
    .sort((a, b) => a.task_order - b.task_order);
}

export async function saveDailyTasks(userId, date, tasks, templateType = 'college', studyDayId = null) {
  if (!userId || !date || !Array.isArray(tasks)) return [];

  const preparedTasks = tasks.map((t, idx) => ({
    user_id: userId,
    study_day_id: studyDayId,
    date,
    task_order: t.task_order ?? idx + 1,
    title: t.title,
    subject: t.subject,
    start_time: t.start_time,
    end_time: t.end_time,
    planned_duration_minutes: Math.max(0, parseInt(t.planned_duration_minutes || 0, 10)),
    actual_duration_minutes: Math.max(0, parseInt(t.actual_duration_minutes || 0, 10)),
    status: t.status || 'Not Started',
    is_completed: Boolean(t.is_completed || t.status === 'Completed'),
    questions_planned: Math.max(0, parseInt(t.questions_planned || 0, 10)),
    questions_attempted: Math.max(0, parseInt(t.questions_attempted || 0, 10)),
    correct_answers: Math.max(0, parseInt(t.correct_answers || 0, 10)),
    incorrect_answers: Math.max(0, parseInt(t.incorrect_answers || 0, 10)),
    difficult_topics_notes: t.difficult_topics_notes || '',
    mistake_notes: t.mistake_notes || '',
    revision_required: Boolean(t.revision_required),
    personal_notes: t.personal_notes || '',
    spans_midnight: Boolean(t.spans_midnight)
  }));

  if (isSupabaseConfigured()) {
    try {
      // Delete existing tasks for this date & user to replace with new set
      const { error: delError } = await supabase
        .from('daily_task_records')
        .delete()
        .eq('user_id', userId)
        .eq('date', date);

      if (delError) throw delError;

      if (preparedTasks.length === 0) return [];

      const { data, error } = await supabase
        .from('daily_task_records')
        .insert(preparedTasks)
        .select()
        .order('task_order', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error saving daily tasks to Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  let allTasks = getLocal(LS_KEYS.TASKS);
  allTasks = allTasks.filter((t) => !(t.user_id === userId && t.date === date));

  const inserted = preparedTasks.map((t) => ({
    ...t,
    id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }));

  allTasks.push(...inserted);
  setLocal(LS_KEYS.TASKS, allTasks);
  return inserted;
}

export async function updateDailyTask(taskId, updates) {
  if (!taskId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('daily_task_records')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating task in Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const tasks = getLocal(LS_KEYS.TASKS);
  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx >= 0) {
    tasks[idx] = {
      ...tasks[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    setLocal(LS_KEYS.TASKS, tasks);
    return tasks[idx];
  }
  return null;
}

// ==========================================
// 3. CODING MISTAKES TRACKER
// ==========================================
export async function getCodingMistakes(userId, { category, difficulty, is_resolved, search } = {}) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('coding_mistakes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }
      if (difficulty && difficulty !== 'All') {
        query = query.eq('difficulty', difficulty);
      }
      if (is_resolved !== undefined && is_resolved !== 'All') {
        query = query.eq('is_resolved', is_resolved === 'true' || is_resolved === true);
      }
      if (search && search.trim()) {
        query = query.ilike('problem_name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error getting coding mistakes from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  let mistakes = getLocal(LS_KEYS.MISTAKES).filter((m) => m.user_id === userId);

  if (category && category !== 'All') {
    mistakes = mistakes.filter((m) => m.category === category);
  }
  if (difficulty && difficulty !== 'All') {
    mistakes = mistakes.filter((m) => m.difficulty === difficulty);
  }
  if (is_resolved !== undefined && is_resolved !== 'All') {
    const bool = is_resolved === 'true' || is_resolved === true;
    mistakes = mistakes.filter((m) => Boolean(m.is_resolved) === bool);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    mistakes = mistakes.filter(
      (m) =>
        m.problem_name.toLowerCase().includes(q) ||
        (m.topic && m.topic.toLowerCase().includes(q))
    );
  }

  return mistakes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export async function saveCodingMistake(userId, mistakeData) {
  if (!userId) throw new Error('User ID required');

  const payload = {
    user_id: userId,
    daily_task_id: mistakeData.daily_task_id || null,
    problem_name: mistakeData.problem_name,
    problem_url: mistakeData.problem_url || '',
    topic: mistakeData.topic,
    pattern: mistakeData.pattern || '',
    difficulty: mistakeData.difficulty || 'Medium',
    category: mistakeData.category || 'Conceptual',
    mistake_explanation: mistakeData.mistake_explanation,
    correct_approach: mistakeData.correct_approach,
    next_revision_date: mistakeData.next_revision_date || null,
    is_resolved: Boolean(mistakeData.is_resolved)
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('coding_mistakes')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving mistake to Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const mistakes = getLocal(LS_KEYS.MISTAKES);
  const newMistake = {
    ...payload,
    id: `mst_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  mistakes.unshift(newMistake);
  setLocal(LS_KEYS.MISTAKES, mistakes);
  return newMistake;
}

export async function updateCodingMistake(mistakeId, updates) {
  if (!mistakeId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('coding_mistakes')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', mistakeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating mistake in Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const mistakes = getLocal(LS_KEYS.MISTAKES);
  const idx = mistakes.findIndex((m) => m.id === mistakeId);
  if (idx >= 0) {
    mistakes[idx] = {
      ...mistakes[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    setLocal(LS_KEYS.MISTAKES, mistakes);
    return mistakes[idx];
  }
  return null;
}

export async function deleteCodingMistake(mistakeId) {
  if (!mistakeId) return;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('coding_mistakes')
        .delete()
        .eq('id', mistakeId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting mistake in Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  let mistakes = getLocal(LS_KEYS.MISTAKES);
  mistakes = mistakes.filter((m) => m.id !== mistakeId);
  setLocal(LS_KEYS.MISTAKES, mistakes);
  return true;
}

// ==========================================
// 4. DIFFICULT TOPICS TRACKER
// ==========================================
export async function getDifficultTopics(userId, { domain, minConfidence, status, search } = {}) {
  if (!userId) return [];

  if (isSupabaseConfigured()) {
    try {
      let query = supabase
        .from('difficult_topics')
        .select('*')
        .eq('user_id', userId)
        .order('confidence_rating', { ascending: true })
        .order('updated_at', { ascending: false });

      if (domain && domain !== 'All') {
        query = query.eq('domain', domain);
      }
      if (status && status !== 'All') {
        query = query.eq('understanding_status', status);
      }
      if (search && search.trim()) {
        query = query.ilike('topic_name', `%${search.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching difficult topics from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  let topics = getLocal(LS_KEYS.TOPICS).filter((t) => t.user_id === userId);

  if (domain && domain !== 'All') {
    topics = topics.filter((t) => t.domain === domain);
  }
  if (status && status !== 'All') {
    topics = topics.filter((t) => t.understanding_status === status);
  }
  if (search && search.trim()) {
    const q = search.trim().toLowerCase();
    topics = topics.filter((t) => t.topic_name.toLowerCase().includes(q));
  }

  return topics.sort((a, b) => a.confidence_rating - b.confidence_rating);
}

export async function saveDifficultTopic(userId, topicData) {
  if (!userId) throw new Error('User ID required');

  const payload = {
    user_id: userId,
    topic_name: topicData.topic_name,
    domain: topicData.domain || 'DSA',
    reason_difficult: topicData.reason_difficult,
    confidence_rating: Math.min(5, Math.max(1, parseInt(topicData.confidence_rating || 1, 10))),
    revision_attempts: Math.max(0, parseInt(topicData.revision_attempts || 0, 10)),
    last_revised_date: topicData.last_revised_date || null,
    understanding_status: topicData.understanding_status || 'Struggling'
  };

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('difficult_topics')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error saving difficult topic to Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const topics = getLocal(LS_KEYS.TOPICS);
  const newTopic = {
    ...payload,
    id: `top_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  topics.unshift(newTopic);
  setLocal(LS_KEYS.TOPICS, topics);
  return newTopic;
}

export async function updateDifficultTopic(topicId, updates) {
  if (!topicId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('difficult_topics')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error updating difficult topic in Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const topics = getLocal(LS_KEYS.TOPICS);
  const idx = topics.findIndex((t) => t.id === topicId);
  if (idx >= 0) {
    topics[idx] = {
      ...topics[idx],
      ...updates,
      updated_at: new Date().toISOString()
    };
    setLocal(LS_KEYS.TOPICS, topics);
    return topics[idx];
  }
  return null;
}

export async function deleteDifficultTopic(topicId) {
  if (!topicId) return;

  if (isSupabaseConfigured()) {
    try {
      const { error } = await supabase
        .from('difficult_topics')
        .delete()
        .eq('id', topicId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error deleting topic from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  let topics = getLocal(LS_KEYS.TOPICS);
  topics = topics.filter((t) => t.id !== topicId);
  setLocal(LS_KEYS.TOPICS, topics);
  return true;
}

// Log topic revision attempt & record in revision_logs
export async function logTopicRevision(userId, { topicId, newConfidence, notes = '' }) {
  if (!userId || !topicId) return null;

  const todayStr = getKolkataDateString();

  if (isSupabaseConfigured()) {
    try {
      // 1. Fetch current topic
      const { data: topic, error: fetchErr } = await supabase
        .from('difficult_topics')
        .select('*')
        .eq('id', topicId)
        .single();

      if (fetchErr) throw fetchErr;

      const prevConfidence = topic.confidence_rating;
      const updatedAttempts = (topic.revision_attempts || 0) + 1;
      const conf = Math.min(5, Math.max(1, parseInt(newConfidence, 10)));

      let newStatus = topic.understanding_status;
      if (conf >= 5) newStatus = 'Mastered';
      else if (conf >= 4) newStatus = 'Comfortable';
      else if (conf >= 3) newStatus = 'Improving';
      else newStatus = 'Struggling';

      // 2. Insert revision log
      await supabase.from('revision_logs').insert({
        user_id: userId,
        target_type: 'difficult_topic',
        target_id: topicId,
        previous_confidence: prevConfidence,
        new_confidence: conf,
        notes,
        revision_date: todayStr
      });

      // 3. Update topic
      const { data: updatedTopic, error: updateErr } = await supabase
        .from('difficult_topics')
        .update({
          confidence_rating: conf,
          revision_attempts: updatedAttempts,
          last_revised_date: todayStr,
          understanding_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', topicId)
        .select()
        .single();

      if (updateErr) throw updateErr;
      return updatedTopic;
    } catch (err) {
      console.error('Error logging revision in Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const topics = getLocal(LS_KEYS.TOPICS);
  const idx = topics.findIndex((t) => t.id === topicId);
  if (idx >= 0) {
    const topic = topics[idx];
    const prevConfidence = topic.confidence_rating;
    const conf = Math.min(5, Math.max(1, parseInt(newConfidence, 10)));
    let newStatus = topic.understanding_status;
    if (conf >= 5) newStatus = 'Mastered';
    else if (conf >= 4) newStatus = 'Comfortable';
    else if (conf >= 3) newStatus = 'Improving';
    else newStatus = 'Struggling';

    const logs = getLocal(LS_KEYS.REVISIONS);
    logs.push({
      id: `rev_${Date.now()}`,
      user_id: userId,
      target_type: 'difficult_topic',
      target_id: topicId,
      previous_confidence: prevConfidence,
      new_confidence: conf,
      notes,
      revision_date: todayStr,
      created_at: new Date().toISOString()
    });
    setLocal(LS_KEYS.REVISIONS, logs);

    topics[idx] = {
      ...topic,
      confidence_rating: conf,
      revision_attempts: (topic.revision_attempts || 0) + 1,
      last_revised_date: todayStr,
      understanding_status: newStatus,
      updated_at: new Date().toISOString()
    };
    setLocal(LS_KEYS.TOPICS, topics);
    return topics[idx];
  }
  return null;
}

// ==========================================
// 5. REPORT GOALS & REFLECTIONS
// ==========================================
export async function getReportGoals(userId, reportType, startDate, endDate) {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase
        .from('report_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('report_type', reportType)
        .eq('start_date', startDate)
        .eq('end_date', endDate)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (err) {
      console.error('Error fetching report goals from Supabase:', err);
      return null;
    }
  }

  // Fallback Local Storage
  const goals = getLocal(LS_KEYS.GOALS);
  return (
    goals.find(
      (g) =>
        g.user_id === userId &&
        g.report_type === reportType &&
        g.start_date === startDate &&
        g.end_date === endDate
    ) || null
  );
}

export async function saveReportGoals(userId, { reportType, startDate, endDate, reflections, nextPeriodGoals }) {
  if (!userId) return null;

  if (isSupabaseConfigured()) {
    try {
      const existing = await getReportGoals(userId, reportType, startDate, endDate);
      if (existing) {
        const { data, error } = await supabase
          .from('report_goals')
          .update({
            reflections,
            next_period_goals: nextPeriodGoals,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('report_goals')
          .insert({
            user_id: userId,
            report_type: reportType,
            start_date: startDate,
            end_date: endDate,
            reflections,
            next_period_goals: nextPeriodGoals
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    } catch (err) {
      console.error('Error saving report goals to Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const goals = getLocal(LS_KEYS.GOALS);
  const idx = goals.findIndex(
    (g) =>
      g.user_id === userId &&
      g.report_type === reportType &&
      g.start_date === startDate &&
      g.end_date === endDate
  );

  let record;
  const now = new Date().toISOString();

  if (idx >= 0) {
    record = {
      ...goals[idx],
      reflections,
      next_period_goals: nextPeriodGoals,
      updated_at: now
    };
    goals[idx] = record;
  } else {
    record = {
      id: `goal_${Date.now()}`,
      user_id: userId,
      report_type: reportType,
      start_date: startDate,
      end_date: endDate,
      reflections,
      next_period_goals: nextPeriodGoals,
      created_at: now,
      updated_at: now
    };
    goals.push(record);
  }

  setLocal(LS_KEYS.GOALS, goals);
  return record;
}

// ==========================================
// 6. RAW SOURCE DATA FOR REPORTS
// ==========================================
export async function getReportSourceData(userId, startDate, endDate) {
  if (!userId || !startDate || !endDate) {
    return { tasks: [], studyDays: [], mistakes: [], difficultTopics: [], revisions: [] };
  }

  if (isSupabaseConfigured()) {
    try {
      const [tasksRes, daysRes, mistakesRes, topicsRes, revisionsRes] = await Promise.all([
        supabase
          .from('daily_task_records')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true })
          .order('task_order', { ascending: true }),

        supabase
          .from('study_days')
          .select('*')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate)
          .order('date', { ascending: true }),

        supabase
          .from('coding_mistakes')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', `${startDate}T00:00:00.000Z`)
          .lte('created_at', `${endDate}T23:59:59.999Z`),

        supabase
          .from('difficult_topics')
          .select('*')
          .eq('user_id', userId),

        supabase
          .from('revision_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('revision_date', startDate)
          .lte('revision_date', endDate)
      ]);

      if (tasksRes.error) throw tasksRes.error;
      if (daysRes.error) throw daysRes.error;
      if (mistakesRes.error) throw mistakesRes.error;
      if (topicsRes.error) throw topicsRes.error;

      return {
        tasks: tasksRes.data || [],
        studyDays: daysRes.data || [],
        mistakes: mistakesRes.data || [],
        difficultTopics: topicsRes.data || [],
        revisions: revisionsRes.data || []
      };
    } catch (err) {
      console.error('Error fetching report source data from Supabase:', err);
      throw err;
    }
  }

  // Fallback Local Storage
  const tasks = getLocal(LS_KEYS.TASKS).filter(
    (t) => t.user_id === userId && t.date >= startDate && t.date <= endDate
  );
  const studyDays = getLocal(LS_KEYS.DAYS).filter(
    (d) => d.user_id === userId && d.date >= startDate && d.date <= endDate
  );
  const mistakes = getLocal(LS_KEYS.MISTAKES).filter(
    (m) => m.user_id === userId && m.created_at.slice(0, 10) >= startDate && m.created_at.slice(0, 10) <= endDate
  );
  const difficultTopics = getLocal(LS_KEYS.TOPICS).filter((t) => t.user_id === userId);
  const revisions = getLocal(LS_KEYS.REVISIONS).filter(
    (r) => r.user_id === userId && r.revision_date >= startDate && r.revision_date <= endDate
  );

  return { tasks, studyDays, mistakes, difficultTopics, revisions };
}

// Compute study streak
export async function calculateStudyStreak(userId) {
  if (!userId) return 0;
  try {
    const today = getKolkataDateString();
    let tasks = [];

    if (isSupabaseConfigured()) {
      const { data } = await supabase
        .from('daily_task_records')
        .select('date, is_completed, status')
        .eq('user_id', userId)
        .order('date', { ascending: false });
      tasks = data || [];
    } else {
      tasks = getLocal(LS_KEYS.TASKS).filter((t) => t.user_id === userId);
    }

    if (!tasks || tasks.length === 0) return 0;

    // Group completed tasks by date
    const completedDates = new Set();
    tasks.forEach((t) => {
      if (t.is_completed || t.status === 'Completed' || t.status === 'Partially Completed') {
        completedDates.add(t.date);
      }
    });

    let streak = 0;
    let checkDate = new Date(today);

    // If today has no completed task yet, check if yesterday had completion
    const todayStr = checkDate.toISOString().slice(0, 10);
    if (!completedDates.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const dateStr = checkDate.toISOString().slice(0, 10);
      if (completedDates.has(dateStr)) {
        streak += 1;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  } catch (e) {
    console.error('Error calculating streak:', e);
    return 0;
  }
}
