import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';
import { Calendar } from '@/components/ui/calendar';

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [mood, setMood] = useState(3);
  const [pain, setPain] = useState(0);
  const [flow, setFlow] = useState(2);

  const cycleDay = 14;
  const cycleLength = 28;
  const nextPeriod = 14;

  const moodEmojis = ['😢', '😕', '😐', '🙂', '😊'];
  const flowLabels = ['Нет', 'Лёгкие', 'Средние', 'Обильные'];

  const symptoms = [
    { icon: 'Droplets', label: 'Выделения', active: true },
    { icon: 'Zap', label: 'Судороги', active: false },
    { icon: 'Brain', label: 'Головная боль', active: true },
    { icon: 'Heart', label: 'Вздутие', active: false },
    { icon: 'Coffee', label: 'Тяга к еде', active: true },
    { icon: 'Moon', label: 'Усталость', active: false },
  ];

  const activities = [
    { icon: 'Utensils', label: 'Питание', value: 1800, max: 2000, unit: 'ккал' },
    { icon: 'Dumbbell', label: 'Активность', value: 45, max: 60, unit: 'мин' },
    { icon: 'Droplet', label: 'Вода', value: 6, max: 8, unit: 'стак' },
    { icon: 'Moon', label: 'Сон', value: 7, max: 8, unit: 'ч' },
  ];

  const insights = [
    { title: 'Овуляция скоро', desc: 'Через 3-5 дней — ваше фертильное окно', color: 'bg-[hsl(var(--ovulation))]' },
    { title: 'Рекомендация', desc: 'Отличный день для йоги и растяжки', color: 'bg-[hsl(var(--accent))]' },
    { title: 'Витамины', desc: 'Не забудьте принять фолиевую кислоту', color: 'bg-[hsl(var(--secondary))]' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--accent))] via-background to-[hsl(var(--secondary))] pb-20">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <header className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Привет, Мария 💜</h1>
            <p className="text-muted-foreground">День цикла: {cycleDay} из {cycleLength}</p>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Icon name="Settings" size={24} />
          </Button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 border-2 shadow-lg animate-scale-in">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">Календарь цикла</CardTitle>
                <Badge variant="secondary" className="text-sm font-medium">
                  Фолликулярная фаза
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-2xl border-2"
                  classNames={{
                    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-lg font-semibold",
                    nav: "space-x-1 flex items-center",
                    nav_button: "h-8 w-8 bg-transparent p-0 opacity-50 hover:opacity-100 rounded-full",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex w-full",
                    head_cell: "text-muted-foreground rounded-md w-full font-medium text-sm",
                    row: "flex w-full mt-2",
                    cell: "h-12 w-full text-center text-sm p-0 relative rounded-xl",
                    day: "h-12 w-full p-0 font-normal rounded-xl hover:bg-accent transition-colors",
                    day_selected: "bg-[hsl(var(--menstruation))] text-foreground font-semibold",
                    day_today: "bg-[hsl(var(--ovulation))] text-foreground font-bold",
                    day_outside: "opacity-30",
                  }}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="bg-[hsl(var(--menstruation))] rounded-2xl p-4 text-center">
                  <Icon name="Calendar" size={28} className="mx-auto mb-2 text-foreground" />
                  <p className="text-2xl font-bold text-foreground">{nextPeriod}</p>
                  <p className="text-sm text-foreground/80">дней до менструации</p>
                </div>
                <div className="bg-[hsl(var(--ovulation))] rounded-2xl p-4 text-center">
                  <Icon name="Heart" size={28} className="mx-auto mb-2 text-foreground" />
                  <p className="text-2xl font-bold text-foreground">3-5</p>
                  <p className="text-sm text-foreground/80">дней до овуляции</p>
                </div>
                <div className="bg-[hsl(var(--fertile))] rounded-2xl p-4 text-center">
                  <Icon name="Sparkles" size={28} className="mx-auto mb-2 text-foreground" />
                  <p className="text-2xl font-bold text-foreground">28</p>
                  <p className="text-sm text-foreground/80">длина цикла</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {insights.map((insight, idx) => (
              <Card key={idx} className={`border-2 shadow-md animate-fade-in`} style={{animationDelay: `${idx * 100}ms`}}>
                <CardContent className="pt-6">
                  <div className={`${insight.color} rounded-2xl p-4 mb-3`}>
                    <Icon name="Lightbulb" size={24} className="text-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{insight.title}</h3>
                  <p className="text-sm text-muted-foreground">{insight.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Tabs defaultValue="tracking" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 h-14 rounded-2xl p-1 bg-card border-2">
            <TabsTrigger value="tracking" className="rounded-xl text-sm font-medium">
              <Icon name="Activity" size={18} className="mr-2" />
              Отслеживание
            </TabsTrigger>
            <TabsTrigger value="health" className="rounded-xl text-sm font-medium">
              <Icon name="Heart" size={18} className="mr-2" />
              Здоровье
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-xl text-sm font-medium">
              <Icon name="TrendingUp" size={18} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="community" className="rounded-xl text-sm font-medium">
              <Icon name="Users" size={18} className="mr-2" />
              Сообщество
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tracking" className="space-y-6 mt-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Как вы себя чувствуете сегодня?</CardTitle>
                <CardDescription>Отмечайте ваше самочувствие каждый день</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Smile" size={20} />
                      Настроение
                    </label>
                    <span className="text-3xl">{moodEmojis[mood]}</span>
                  </div>
                  <Slider
                    value={[mood]}
                    onValueChange={(value) => setMood(value[0])}
                    max={4}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Плохое</span>
                    <span>Отличное</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="AlertCircle" size={20} />
                      Уровень боли
                    </label>
                    <Badge variant={pain > 5 ? "destructive" : "secondary"}>{pain}/10</Badge>
                  </div>
                  <Slider
                    value={[pain]}
                    onValueChange={(value) => setPain(value[0])}
                    max={10}
                    step={1}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-sm font-semibold flex items-center gap-2">
                      <Icon name="Droplets" size={20} />
                      Интенсивность выделений
                    </label>
                    <span className="text-sm font-medium">{flowLabels[flow]}</span>
                  </div>
                  <Slider
                    value={[flow]}
                    onValueChange={(value) => setFlow(value[0])}
                    max={3}
                    step={1}
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold flex items-center gap-2 mb-3">
                    <Icon name="Stethoscope" size={20} />
                    Симптомы
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {symptoms.map((symptom, idx) => (
                      <Button
                        key={idx}
                        variant={symptom.active ? "default" : "outline"}
                        className="h-auto py-3 rounded-xl flex flex-col items-center gap-2"
                      >
                        <Icon name={symptom.icon} size={24} />
                        <span className="text-xs">{symptom.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button className="w-full h-12 text-lg rounded-xl" size="lg">
                  Сохранить данные
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {activities.map((activity, idx) => (
                <Card key={idx} className="border-2 shadow-md">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <Icon name={activity.icon} size={24} className="text-primary" />
                      <span className="text-sm font-semibold">
                        {activity.value}/{activity.max} {activity.unit}
                      </span>
                    </div>
                    <p className="text-sm font-medium mb-2">{activity.label}</p>
                    <Progress value={(activity.value / activity.max) * 100} className="h-2" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-6 mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Weight" size={24} />
                    Отслеживание веса
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <p className="text-5xl font-bold mb-2">62.5</p>
                    <p className="text-muted-foreground mb-4">кг</p>
                    <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                      <Icon name="TrendingDown" size={16} />
                      <span>-0.5 кг за неделю</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full rounded-xl">
                    Добавить измерение
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Pill" size={24} />
                    Контрацепция
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-accent rounded-xl p-4">
                      <p className="font-semibold mb-1">Текущий метод</p>
                      <p className="text-sm text-muted-foreground">Оральные контрацептивы</p>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                      <div>
                        <p className="font-semibold mb-1">Напоминание</p>
                        <p className="text-sm text-muted-foreground">Принять таблетку</p>
                      </div>
                      <Badge>22:00</Badge>
                    </div>
                    <Button variant="outline" className="w-full rounded-xl">
                      Изменить метод
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Baby" size={24} />
                    Беременность
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-6">
                    <Icon name="Heart" size={64} className="mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">Функция пока не активирована</p>
                    <Button className="rounded-xl">
                      Активировать режим планирования
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="BookOpen" size={24} />
                    Информация о здоровье
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="ghost" className="w-full justify-start h-auto py-3 rounded-xl">
                      <Icon name="Book" size={20} className="mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Фазы цикла</p>
                        <p className="text-xs text-muted-foreground">Узнайте больше</p>
                      </div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-auto py-3 rounded-xl">
                      <Icon name="Sparkles" size={20} className="mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Питание по фазам</p>
                        <p className="text-xs text-muted-foreground">Рекомендации</p>
                      </div>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start h-auto py-3 rounded-xl">
                      <Icon name="Dumbbell" size={20} className="mr-3" />
                      <div className="text-left">
                        <p className="font-medium">Упражнения</p>
                        <p className="text-xs text-muted-foreground">Тренировки</p>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6 mt-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="BarChart3" size={24} />
                  Аналитика цикла
                </CardTitle>
                <CardDescription>Ваши данные за последние 6 месяцев</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Средняя длина цикла</span>
                      <span className="text-2xl font-bold">28 дней</span>
                    </div>
                    <Progress value={93} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Регулярность</span>
                      <Badge variant="secondary">Отличная</Badge>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4">
                    <div className="text-center p-4 bg-accent rounded-xl">
                      <p className="text-3xl font-bold mb-1">5</p>
                      <p className="text-xs text-muted-foreground">дней менструации</p>
                    </div>
                    <div className="text-center p-4 bg-secondary rounded-xl">
                      <p className="text-3xl font-bold mb-1">14</p>
                      <p className="text-xs text-muted-foreground">день овуляции</p>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <p className="text-3xl font-bold mb-1">±2</p>
                      <p className="text-xs text-muted-foreground">дня вариация</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Частые симптомы</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {['Головная боль', 'Тяга к еде', 'Усталость', 'Вздутие'].map((symptom, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="text-sm">{symptom}</span>
                        <div className="flex items-center gap-2">
                          <Progress value={(4 - idx) * 25} className="w-24 h-2" />
                          <span className="text-xs text-muted-foreground">{4 - idx}0%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Настроение по фазам</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { phase: 'Менструация', emoji: '😐' },
                      { phase: 'Фолликулярная', emoji: '🙂' },
                      { phase: 'Овуляция', emoji: '😊' },
                      { phase: 'Лютеиновая', emoji: '😕' },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                        <span className="text-sm font-medium">{item.phase}</span>
                        <span className="text-2xl">{item.emoji}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="community" className="space-y-6 mt-6">
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="MessageCircle" size={24} />
                  Сообщество
                </CardTitle>
                <CardDescription>Общайтесь, делитесь опытом и поддерживайте друг друга</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { title: 'Подготовка к беременности', members: 1234, posts: 89 },
                    { title: 'Менструальные боли', members: 2456, posts: 156 },
                    { title: 'СПКЯ и эндометриоз', members: 987, posts: 67 },
                    { title: 'Здоровое питание', members: 3421, posts: 234 },
                  ].map((group, idx) => (
                    <div key={idx} className="p-4 border-2 rounded-xl hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{group.title}</h3>
                        <Icon name="ChevronRight" size={20} />
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Icon name="Users" size={14} />
                          {group.members}
                        </span>
                        <span className="flex items-center gap-1">
                          <Icon name="MessageSquare" size={14} />
                          {group.posts}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-6 rounded-xl" size="lg">
                  Создать новую тему
                </Button>
              </CardContent>
            </Card>

            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="UserCircle" size={24} />
                  Консультация специалиста
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <Icon name="Stethoscope" size={64} className="mx-auto mb-4 text-primary" />
                  <p className="font-medium mb-2">Получите профессиональную консультацию</p>
                  <p className="text-sm text-muted-foreground mb-6">
                    Свяжитесь с врачом-гинекологом онлайн
                  </p>
                  <Button className="rounded-xl" size="lg">
                    Записаться на консультацию
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="border-2 shadow-lg bg-gradient-to-br from-primary/10 to-secondary/10">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-white rounded-2xl p-4">
                  <Icon name="Sparkles" size={32} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Персональные советы</h3>
                  <p className="text-sm text-muted-foreground">
                    Получайте рекомендации на основе ваших данных
                  </p>
                </div>
              </div>
              <Button className="rounded-xl">Узнать больше</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t-2 shadow-lg">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-around h-20">
            {[
              { icon: 'Calendar', label: 'Календарь' },
              { icon: 'Activity', label: 'Трекинг' },
              { icon: 'Home', label: 'Главная', active: true },
              { icon: 'BarChart3', label: 'Аналитика' },
              { icon: 'User', label: 'Профиль' },
            ].map((item, idx) => (
              <button
                key={idx}
                className={`flex flex-col items-center gap-1 transition-colors ${
                  item.active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={item.icon} size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Index;
