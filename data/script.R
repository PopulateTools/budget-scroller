library(ggplot2)
library(dplyr)
library(tidyr)

df <- read.csv("income.csv")

df <- mutate(df, pct_budget = round(amount / total_budget * 100, 1))

# Filtering by budget line
multas <- filter(df, budget_line_3_code == '391')

# Aggregate variable (when we have level 4)
ag_multas <- multas %>%
  group_by(ine_code) %>%
  summarise(
    total_amount = sum(amount),
    total_amount_per_inhabitant = sum(amount_per_inhabitant)
  )

# Merge datasets and select columns (when we have level 4)
multas_total <- merge(ag_multas, multas)
multas_total <- unique(select(multas_total, ine_code, place_name, total_amount, total_amount_per_inhabitant, population, autonomous_region_id))

# Charting
multas$autonomous_region_id <- factor(multas$autonomous_region_id)

ggplot(multas, aes(amount_per_inhabitant, log10(population))) + 
  geom_point(aes(color = autonomous_region_id))

################
# Stacked charts
################

# Spain
df_ag <- df %>%
  group_by(budget_line_1_name) %>%
  summarise(
    total_amount = sum(amount)
  ) %>%
  mutate(
    total_budget = sum(total_amount),
    pct_budget = round(total_amount / total_budget * 100, 1)
  )

df_ag$budget_line_1_name <- factor(df_ag$budget_line_1_name)
df_ag$place_name <- 'Spain'

ggplot(df_ag, aes(place_name, total_amount, fill=budget_line_1_name)) +
  geom_bar(stat = 'identity', position = 'fill') + 
  coord_flip()

# Autonomous region
vlc <- filter(df, autonomous_region_id == 10)

vlc_ag <- vlc %>%
  group_by(budget_line_1_name) %>%
  summarise(
    total_amount = sum(amount)
  ) %>%
  mutate(
    total_budget = sum(total_amount),
    pct_budget = round(total_amount / total_budget * 100, 1)
  )

vlc_ag$budget_line_1_name <- factor(vlc_ag$budget_line_1_name)
vlc_ag$place_name <- 'Comunitat Valenciana'

ggplot(cat_ag, aes(place_name, total_amount, fill=budget_line_2_name)) +
  geom_bar(stat = 'identity', position = 'fill') + 
  coord_flip()

# City
denia <- filter(df, ine_code == '3063')

denia_ag <- denia %>%
  group_by(budget_line_1_name) %>%
  summarise(
    total_amount = sum(amount)
  ) %>%
  mutate(
    total_budget = sum(total_amount),
    pct_budget = round(total_amount / total_budget * 100, 1)
  )

denia_ag$budget_line_1_name <- factor(denia_ag$budget_line_1_name)
denia_ag$place_name <- 'Dénia'

ggplot(city_ag, aes(place_name, pct_budget, fill=budget_line_2_name)) +
  geom_bar(stat = 'identity', position = 'fill') + 
  coord_flip()

# Write
out <- rbind(df_ag, vlc_ag, denia_ag)

write.csv(out, 'out.csv', row.names = FALSE)
